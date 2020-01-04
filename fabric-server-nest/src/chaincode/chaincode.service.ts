import { Injectable, Inject, BadRequestException } from '@nestjs/common';
import { ClientService } from '../client/client.service';
import { ProposalResponse, BroadcastResponse, ChaincodeInvokeRequest } from 'fabric-client';
import { WINSTON } from '../constant';
import { Logger } from 'winston';

@Injectable()
export class ChaincodeService {

    constructor(
        @Inject(WINSTON) private readonly logger: Logger,
        private readonly clientService: ClientService,
    ) { }

    public async installChaincode(peers: string[], username: string, organizationName: string) {
        this.logger.info('============ Install chaincode on organizations ============');
        const client = await this.clientService.getClientForOrg(organizationName, username);
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
        const client = await this.clientService.getClientForOrg(organizationName, username);
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
        const client = await this.clientService.getClientForOrg(organizationName, username);
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
            .reduce((previous, current) => previous && current);
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
        const client = await this.clientService.getClientForOrg(organizationName, username);
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
}
