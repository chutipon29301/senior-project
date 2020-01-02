import { Injectable, Inject, BadRequestException } from '@nestjs/common';
import { ClientService } from '../client/client.service';
import { ChaincodeInstallRequest, ProposalErrorResponse, ProposalResponse, BroadcastResponse, ChaincodeInvokeRequest } from 'fabric-client';
import { WINSTON } from '../constant';
import { Logger } from 'winston';
import { format } from 'util';
import { Response } from './chaincode.dto';

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
                                { unregister: true, disconnect: true }
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
                            { unregister: true, disconnect: true }
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
            targets: [peer], //queryByChaincode allows for multiple targets
            chaincodeId: chaincodeName,
            fcn,
            args,
        });
        this.logger.info(responsePayloads.map(o => o.toString()));
        return responsePayloads.toString();
    }
    // public async queryChaincode(
    //     peer: string,
    //     channelName: string,
    //     chaincodeName: string,
    //     args: string[],
    //     fcn: string,
    //     username: string,
    //     orgName: string): Promise<string> {
    //     let client = null;
    //     let channel = null;
    //     try {
    //         // first setup the client for this org
    //         client = await this.clientService.getClientForOrg(orgName, username);
    //         this.logger.debug('Successfully got the fabric client for the organization "%s"', orgName);
    //         channel = client.getChannel(channelName);
    //         if (!channel) {
    //             let message = format('Channel %s was not defined in the connection profile', channelName);
    //             this.logger.error(message);
    //             throw new Error(message);
    //         }

    //         // send query
    //         const request = {
    //             targets: [peer], //queryByChaincode allows for multiple targets
    //             chaincodeId: chaincodeName,
    //             fcn,
    //             args,
    //         };
    //         const responsePayloads = await channel.queryByChaincode(request);
    //         if (responsePayloads) {
    //             for (let i = 0; i < responsePayloads.length; i++) {
    //                 this.logger.info(args[0] + ' now has ' + responsePayloads[i].toString('utf8') +
    //                     ' after the move');
    //             }
    //             return args[0] + ' now has ' + responsePayloads[0].toString('utf8') +
    //                 ' after the move';
    //         } else {
    //             this.logger.error('responsePayloads is null');
    //             return 'responsePayloads is null';
    //         }
    //     } catch (error) {
    //         this.logger.error('Failed to query due to error: ' + error.stack ? error.stack : error);
    //         return error.toString();
    //     } finally {
    //         if (channel) {
    //             channel.close();
    //         }
    //     }
    // }
    // public async getBlockByNumber(
    //     peer: string,
    //     channelName: string,
    //     blockNumber: number,
    //     username: string,
    //     orgName: string): Promise<any> {
    //     try {
    //         // first setup the client for this org
    //         const client = await this.clientService.getClientForOrg(orgName, username);
    //         this.logger.debug('Successfully got the fabric client for the organization "%s"', orgName);
    //         const channel = client.getChannel(channelName);
    //         if (!channel) {
    //             let message = format('Channel %s was not defined in the connection profile', channelName);
    //             this.logger.error(message);
    //             throw new Error(message);
    //         }

    //         const responsePayload = await channel.queryBlock(parseInt(`${blockNumber}`, +peer));
    //         if (responsePayload) {
    //             this.logger.debug(responsePayload);
    //             return responsePayload;
    //         } else {
    //             this.logger.error('responsePayload is null');
    //             return 'responsePayload is null';
    //         }
    //     } catch (error) {
    //         this.logger.error('Failed to query due to error: ' + error.stack ? error.stack : error);
    //         return error.toString();
    //     }
    // }
    // public async getTransactionByID(
    //     peer: string,
    //     channelName: string,
    //     trxnID: string,
    //     username: string,
    //     orgName: string): Promise<any> {
    //     try {
    //         // first setup the client for this org
    //         const client = await this.clientService.getClientForOrg(orgName, username);
    //         this.logger.info('Successfully got the fabric client for the organization "%s"', orgName);
    //         const channel = client.getChannel(channelName);
    //         if (!channel) {
    //             let message = format('Channel %s was not defined in the connection profile', channelName);
    //             this.logger.error(message);
    //             throw new Error(message);
    //         }
    //         const responsePayload = await channel.queryTransaction(trxnID, peer);
    //         if (responsePayload) {
    //             this.logger.info(responsePayload);
    //             return responsePayload;
    //         } else {
    //             this.logger.error('responsePayload is null');
    //             return 'responsePayload is null';
    //         }
    //     } catch (error) {
    //         this.logger.error('Failed to query due to error: ' + error.stack ? error.stack : error);
    //         return error.toString();
    //     }
    // }
    // public async getBlockByHash(
    //     peer: string,
    //     channelName: string,
    //     hash: string,
    //     username: string,
    //     orgName: string): Promise<any> {
    //     try {
    //         // first setup the client for this org
    //         const client = await this.clientService.getClientForOrg(orgName, username);
    //         this.logger.debug('Successfully got the fabric client for the organization "%s"', orgName);
    //         const channel = client.getChannel(channelName);
    //         if (!channel) {
    //             let message = format('Channel %s was not defined in the connection profile', channelName);
    //             this.logger.error(message);
    //             throw new Error(message);
    //         }

    //         const responsePayload = await channel.queryBlockByHash(Buffer.from(hash, 'hex'), peer);
    //         if (responsePayload) {
    //             this.logger.debug(responsePayload);
    //             return responsePayload;
    //         } else {
    //             this.logger.error('responsePayload is null');
    //             return 'responsePayload is null';
    //         }
    //     } catch (error) {
    //         this.logger.error('Failed to query due to error: ' + error.stack ? error.stack : error);
    //         return error.toString();
    //     }

    // }
    // public async getChainInfo(
    //     peer: string,
    //     channelName: string,
    //     username: string,
    //     orgName: string): Promise<any> {
    //     try {
    //         // first setup the client for this org
    //         const client = await this.clientService.getClientForOrg(orgName, username);
    //         this.logger.debug('Successfully got the fabric client for the organization "%s"', orgName);
    //         const channel = client.getChannel(channelName);
    //         if (!channel) {
    //             let message = format('Channel %s was not defined in the connection profile', channelName);
    //             this.logger.error(message);
    //             throw new Error(message);
    //         }

    //         const responsePayload = await channel.queryInfo(peer);
    //         if (responsePayload) {
    //             this.logger.debug(responsePayload);
    //             return responsePayload;
    //         } else {
    //             this.logger.error('responsePayload is null');
    //             return 'responsePayload is null';
    //         }
    //     } catch (error) {
    //         this.logger.error('Failed to query due to error: ' + error.stack ? error.stack : error);
    //         return error.toString();
    //     }
    // }

    // public async getInstalledChaincodes (
    //     peer: string,
    //     channelName: string,
    //     type: string,
    //     username: string,
    //     orgName: string): Promise<any> {
    //     try {
    //         // first setup the client for this org
    //         const client = await this.clientService.getClientForOrg(orgName, username);
    //         this.logger.debug('Successfully got the fabric client for the organization "%s"', orgName);
    //         let response = null
    //         if (type === 'installed') {
    //             response = await client.queryInstalledChaincodes(peer, true); //use the admin identity
    //         } else {
    //             const channel = client.getChannel(channelName);
    //             if(!channel) {
    //                 const message = format('Channel %s was not defined in the connection profile', channelName);
    //                 this.logger.error(message);
    //                 throw new Error(message);
    //             }
    //             response = await channel.queryInstantiatedChaincodes(peer, true); //use the admin identity
    //         }
    //         if (response) {
    //             if (type === 'installed') {
    //                 this.logger.debug('<<< Installed Chaincodes >>>');
    //             } else {
    //                 this.logger.debug('<<< Instantiated Chaincodes >>>');
    //             }
    //             let details = [];
    //             for (let i = 0; i < response.chaincodes.length; i++) {
    //                 this.logger.debug('name: ' + response.chaincodes[i].name + ', version: ' +
    //                     response.chaincodes[i].version + ', path: ' + response.chaincodes[i].path
    //                 );
    //                 details.push('name: ' + response.chaincodes[i].name + ', version: ' +
    //                     response.chaincodes[i].version + ', path: ' + response.chaincodes[i].path
    //                 );
    //             }
    //             return details;
    //         } else {
    //             this.logger.error('response is null');
    //             return 'response is null';
    //         }
    //     } catch(error) {
    //         this.logger.error('Failed to query due to error: ' + error.stack ? error.stack : error);
    //         return error.toString();
    //     }

    // }

}
