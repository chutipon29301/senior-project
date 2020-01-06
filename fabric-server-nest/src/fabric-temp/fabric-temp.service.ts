import { Injectable, Inject, BadRequestException } from '@nestjs/common';
import { Logger } from 'winston';
import { WINSTON } from '../constant';
import * as Client from 'fabric-client';
import { readFileSync } from 'fs';
import { ChannelRequest, ProposalResponse, BroadcastResponse, ChaincodeInvokeRequest } from 'fabric-client';
import { join } from 'path';

@Injectable()
export class FabricTempService {

    constructor(@Inject(WINSTON) private readonly logger: Logger) { }

    public async findUserOrCreate(username: string, organizationName: string) {
        const client = await this.getClientForOrg(organizationName);
        this.logger.info('Successfully initialized the credential stores');
        let user = await client.getUserContext(username, true);
        if (!(user && user.isEnrolled())) {
            // Create new user if not enrolled
            this.logger.debug(`User ${username} was not enrolled, so we will need an admin user object to register`);
            const adminUser = await client.setUserContext({ username: 'admin', password: 'adminpw' });
            const caClient = client.getCertificateAuthority();
            const secret = await caClient.register({
                enrollmentID: username,
                affiliation: `${organizationName.toLowerCase()}.department1`,
            }, adminUser);
            user = await client.setUserContext({ username, password: secret });
        }
        if (!(user && user.isEnrolled())) {
            throw new BadRequestException('User was not enrolled');
        }
    }

    public async createChannel(channelName: string, username: string, organizationName: string) {
        this.logger.info(`====== Creating Channel '${channelName}' ======`);
        // Setup client for organization
        const client = await this.getClientForOrg(organizationName, username);
        this.logger.info(`Successfully got the fabric client for the organization ${organizationName}`);
        // Get channel config generated from configtx
        const channelConfig = client.extractChannelConfig(readFileSync('/home/server/artifacts/channel/mychannel.tx'));
        // Acting as a client in the given organization provided with "organizationName" param
        // sign the channel config bytes as "endorsement", this is required by
        // the orderer's channel creation policy
        // this will use the admin identity assigned to the client when the connection profile was loaded
        const signature = client.signChannelConfig(channelConfig);
        const request: Partial<ChannelRequest> = {
            config: channelConfig,
            signatures: [signature],
            name: channelName,
            txId: client.newTransactionID(true),
        };
        // send to orderer
        const result = await client.createChannel(request as ChannelRequest);
        this.logger.info(`Create channel result ${result.status}:: ${result.info}`);
        if (!result) {
            throw new BadRequestException(`Failed to create the channel '${channelName}'`);
        }
        if (result.status !== 'SUCCESS') {
            throw new BadRequestException(`Failed to create the channel '${channelName}'`);
        }
    }

    public async joinChannel(channelName: string, peers: string[], username: string, organizationName: string) {
        // first setup the client for this org
        const client = await this.getClientForOrg(organizationName, username);
        this.logger.info(`Successfully got the fabric client for the organization '${organizationName}'`);
        const channel = client.getChannel(channelName);
        if (!channel) {
            throw new BadRequestException('Channel not found');
        }
        // next step is to get the genesis_block from the orderer,
        // the starting point for the channel that we want to join
        const genesisBlock = await channel.getGenesisBlock({
            txId: client.newTransactionID(true),
        });
        // tell each peer to join and wait 10 seconds
        // for the channel to be created on each peer
        const promises: Array<Promise<ProposalResponse[]>> = [];
        promises.push(new Promise(resolve => setTimeout(resolve, 10000)));
        promises.push(channel.joinChannel({
            targets: peers, // using the peer names which only is allowed when a connection profile is loaded
            txId: client.newTransactionID(true), // get an admin based transactionID
            block: genesisBlock,
        }));
        const results = await Promise.all(promises);
        this.logger.info('Join Channel R E S P O N S E : %j', results);
        const peersResults = results.pop();
        peersResults.forEach(result => {
            if (result.response && result.response.status === 200) {
                this.logger.debug(`Successfully joined peer to the channel ${channelName}`);
            } else {
                throw new BadRequestException(`Failed to join peer to the channel with error :: ${result.toString()}`);
            }
        });
    }

    public async updateAnchorPeers(channelName: string, configUpdatePath: string, username: string, organizationName: string) {
        this.logger.info(`====== Updating Anchor Peers on '${channelName}' ======`);
        // first setup the client for this org
        const client = await this.getClientForOrg(organizationName, username);
        this.logger.info(`Successfully got the fabric client for the organization '${organizationName}'`);
        const channel = client.getChannel(channelName);
        if (!channel) {
            throw new BadRequestException('Channel not found');
        }
        // read in the envelope for the channel config raw bytes
        const channelConfig = client.extractChannelConfig(readFileSync(join('/home/server/artifacts/channel', configUpdatePath)));
        const signature = client.signChannelConfig(channelConfig);

        const eventHubs = channel.getChannelEventHubsForOrg();
        this.logger.info(`found ${eventHubs.length} eventhubs for this organization ${organizationName}`);
        const results = await Promise.all([
            ...eventHubs.map(eventHub => new Promise((resolve, reject) => {
                const eventTimeout = setTimeout(() => {
                    this.logger.info(`REQUEST_TIMEOUT: ${eventHub.getPeerAddr()}`);
                    eventHub.disconnect();
                }, 60000);
                eventHub.registerBlockEvent((_) => {
                    this.logger.info(`The config update has been committed on peer ${eventHub.getPeerAddr()}`);
                    clearTimeout(eventTimeout);
                    resolve();
                }, (err) => {
                    clearTimeout(eventTimeout);
                    this.logger.info(err);
                    reject(err);
                },
                    // the default for 'unregister' is true for block listeners
                    // so no real need to set here, however for 'disconnect'
                    // the default is false as most event hubs are long running
                    // in this use case we are using it only once
                    { unregister: true, disconnect: true },
                );
                eventHub.connect();
            })),
            client.updateChannel({
                config: channelConfig,
                signatures: [signature],
                name: channelName,
                txId: client.newTransactionID(true), // get an admin based transactionID
            } as ChannelRequest),
        ]);
        const response = results.pop() as BroadcastResponse; //  orderer results are last in the results
        if (!response) {
            throw new BadRequestException(`Failed to create the channel '${channelName}'`);
        }
        if (response.status !== 'SUCCESS') {
            throw new BadRequestException(`Failed to create the channel '${channelName}'`);
        }
    }

    public async installChaincode(peers: string[], username: string, organizationName: string) {
        this.logger.info('============ Install chaincode on organizations ============');
        const client = await this.getClientForOrg(organizationName, username);
        this.logger.info(`Successfully got the fabric client for the organization "${organizationName}"`);

        const [proposalResponses] = await client.installChaincode({
            targets: peers,
            chaincodePath: `/home/server/artifacts/src/github.com/example_cc/node`,
            chaincodeId: 'mycc',
            chaincodeVersion: 'v0',
            chaincodeType: 'node',
        });

        for (const response of proposalResponses) {
            const proposalResponse = response as ProposalResponse;
            if (!(proposalResponse.response && proposalResponse.response.status === 200)) {
                throw new BadRequestException(response.toString());
            }
        }
    }

    public async instantiateChaincode(
        peers: string[],
        channelName: string,
        functionName: string,
        args: string[],
        username: string,
        organizationName: string,
    ) {
        this.logger.info(`============ Instantiate chaincode on channel ${channelName} ============`);
        const client = await this.getClientForOrg(organizationName, username);
        this.logger.info(`Successfully got the fabric client for the organization "${organizationName}"`);
        const channel = client.getChannel(channelName);
        if (!channel) {
            throw new BadRequestException('Channel not found');
        }
        const txId = client.newTransactionID(true); // Get an admin based transactionID
        // An admin based transactionID will
        // indicate that admin identity should
        // be used to sign the proposal request.
        // will need the transaction ID string for the event registration later
        const deployId = txId.getTransactionID();
        const [proposalResponses, proposal] = await channel.sendInstantiateProposal({
            'targets': peers,
            'chaincodeId': 'mycc',
            'chaincodeType': 'node',
            'chaincodeVersion': 'v0',
            args,
            txId,
            'endorsement-policy': {
                identities: [
                    { role: { name: 'member', mspId: 'Org1MSP' } },
                    { role: { name: 'member', mspId: 'Org2MSP' } },
                ],
                policy: {
                    '2-of': [{ 'signed-by': 0 }, { 'signed-by': 1 }],
                },
            },
            'fcn': functionName,
        }, 180000);
        const allGood = proposalResponses
            .map((proposalResponse: ProposalResponse) => proposalResponse.response && proposalResponse.response.status === 200)
            .reduce((previous, current) => previous && current);
        try {
            if (allGood) {
                const proposalResponse = proposalResponses[0] as ProposalResponse;
                this.logger.info(`
                    Successfully sent Proposal and received ProposalResponse: Status - ${proposalResponse.response.status},
                    message - "${proposalResponse.response.message}",
                    metadata - "${proposalResponse.response.payload}",
                    endorsement signature: ${proposalResponse.endorsement.signature}
                `);
                const eventHubs = channel.getChannelEventHubsForOrg();
                this.logger.info(`found ${eventHubs.length} eventhubs for this organization ${organizationName}`);
                const results = await Promise.all([
                    ...eventHubs.map(eventHub => {
                        return new Promise((resolve, reject) => {
                            const eventTimeout = setTimeout(() => {
                                this.logger.error(`REQUEST_TIMEOUT:${eventHub.getPeerAddr()}`);
                                eventHub.disconnect();
                            }, 60000);
                            eventHub.registerTxEvent(deployId, (tx, code, blockNum) => {
                                this.logger.info(`The chaincode instantiate transaction has been committed on peer ${eventHub.getPeerAddr()}`);
                                this.logger.info(`Transaction ${tx} has status of ${code} in block ${blockNum}`);
                                clearTimeout(eventTimeout);

                                if (code !== 'VALID') {
                                    reject(new Error(`The chaincode instantiate transaction was invalid, code:${code}`));
                                } else {
                                    resolve();
                                }
                            }, (err) => {
                                clearTimeout(eventTimeout);
                                reject(err);
                            },
                                // the default for 'unregister' is true for transaction listeners
                                // so no real need to set here, however for 'disconnect'
                                // the default is false as most event hubs are long running
                                // in this use case we are using it only once
                                { unregister: true, disconnect: true },
                            );
                            eventHub.connect();
                        });
                    }),
                    channel.sendTransaction({
                        txId, // must include the transaction id so that the outbound
                        // transaction to the orderer will be signed by the admin id
                        // the same as the proposal above, notice that transactionID
                        // generated above was based on the admin id not the current
                        // user assigned to the 'client' instance.
                        proposalResponses: proposalResponses as ProposalResponse[],
                        proposal,
                    }),
                ]);
                const response = results.pop() as BroadcastResponse; //  orderer results are last in the results
                if (response.status !== 'SUCCESS') {
                    throw new BadRequestException(response.status);
                }
            }

        } catch (error) {
            throw new BadRequestException(error.toString());
        } finally {
            if (channel) {
                channel.close();
            }
        }
    }

    public async invokeChaincode(
        peerNames: string[],
        channelName: string,
        chaincodeName: string,
        fcn: string,
        args: string[],
        username: string,
        organizationName: string,
    ) {
        this.logger.info(`============ invoke transaction on channel ${channelName} ============`);
        const client = await this.getClientForOrg(organizationName, username);
        this.logger.info(`Successfully got the fabric client for the organization '${organizationName}'`);
        const channel = client.getChannel(channelName);
        if (!channel) {
            throw new BadRequestException('Channel not found');
        }
        const txId = client.newTransactionID();
        // will need the transaction ID string for the event registration later
        const txIdString = txId.getTransactionID();
        const [proposalResponses, proposal] = await channel.sendTransactionProposal({
            targets: peerNames,
            chaincodeId: chaincodeName,
            fcn,
            args,
            chainId: channelName,
            txId,
        } as ChaincodeInvokeRequest);
        const allGood = proposalResponses
            .map((proposalResponse: ProposalResponse) => proposalResponse.response && proposalResponse.response.status === 200)
            .reduce((previous: boolean, current: boolean) => previous && current);
        if (allGood) {
            const proposalResponse = proposalResponses[0] as ProposalResponse;
            this.logger.info(`
                Successfully sent Proposal and received ProposalResponse: Status - ${proposalResponse.response.status},
                message - "${proposalResponse.response.message}",
                metadata - "${proposalResponse.response.payload}",
                endorsement signature: ${proposalResponse.endorsement.signature}
            `);
            const eventHubs = channel.getChannelEventHubsForOrg();
            const results = await Promise.all([
                ...eventHubs.map(eventHub => {
                    return new Promise((resolve, reject) => {
                        const eventTimeout = setTimeout(() => {
                            this.logger.error(`REQUEST_TIMEOUT:${eventHub.getPeerAddr()}`);
                            eventHub.disconnect();
                        }, 60000);
                        eventHub.registerTxEvent(txIdString, (tx, code, blockNum) => {
                            this.logger.info(`The chaincode instantiate transaction has been committed on peer ${eventHub.getPeerAddr()}`);
                            this.logger.info(`Transaction ${tx} has status of ${code} in block ${blockNum}`);
                            clearTimeout(eventTimeout);

                            if (code !== 'VALID') {
                                reject(new Error(`The chaincode instantiate transaction was invalid, code:${code}`));
                            } else {
                                resolve();
                            }
                        }, (err) => {
                            clearTimeout(eventTimeout);
                            reject(err);
                        },
                            // the default for 'unregister' is true for transaction listeners
                            // so no real need to set here, however for 'disconnect'
                            // the default is false as most event hubs are long running
                            // in this use case we are using it only once
                            { unregister: true, disconnect: true },
                        );
                        eventHub.connect();
                    });
                }),
                channel.sendTransaction({
                    txId, // must include the transaction id so that the outbound
                    // transaction to the orderer will be signed by the admin id
                    // the same as the proposal above, notice that transactionID
                    // generated above was based on the admin id not the current
                    // user assigned to the 'client' instance.
                    proposalResponses: proposalResponses as ProposalResponse[],
                    proposal,
                }),
            ]);
        }
    }

    public async queryChaincode(
        peer: string,
        channelName: string,
        chaincodeName: string,
        args: string[],
        fcn: string,
        username: string,
        organizationName: string,
    ): Promise<string> {
        const client = await this.getClientForOrg(organizationName, username);
        this.logger.info('Successfully got the fabric client for the organization "%s"', organizationName);
        const channel = client.getChannel(channelName);
        if (!channel) {
            throw new BadRequestException('Channel not found');
        }
        const responsePayloads = await channel.queryByChaincode({
            targets: [peer], // queryByChaincode allows for multiple targets
            chaincodeId: chaincodeName,
            fcn,
            args,
        });
        this.logger.info(responsePayloads.map(o => o.toString()));
        return responsePayloads.toString();
    }

    public async getClientForOrg(userOrg: string, username?: string): Promise<Client> {
        this.logger.debug(`getClientForOrg - ****** START ${userOrg} ${username}`)
        const client = Client.loadFromConfig('/home/server/artifacts/network-config.yaml');
        client.loadFromConfig(`/home/server/artifacts/${userOrg.toLowerCase()}.yaml`);
        await client.initCredentialStores();
        if (username) {
            const user = await client.getUserContext(username, true);
            if (!user) {
                throw new BadRequestException(`User was not found : ${username}`);
            } else {
                this.logger.debug('User %s was found to be registered and enrolled', username);
            }
        }
        this.logger.debug('getClientForOrg - ****** END %s %s \n\n', userOrg, username);
        return client;
    }
}
