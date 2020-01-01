import { Injectable, Inject } from '@nestjs/common';
import { ClientService } from '../client/client.service';
import { ChaincodeInstallRequest } from 'fabric-client';
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

    public async installChaincode(peers: string[], username: string, orgName: string) {
        this.logger.info('\n\n============ Install chaincode on organizations ============\n');
        let errorMessage = null;
        try {
            this.logger.info(`Calling peers in organization ${orgName} to join the channel`);

            // first setup the client for this org
            const client = await this.clientService.getClientForOrg(orgName, username);
            this.logger.info('Successfully got the fabric client for the organization "%s"', orgName);

            const request = {
                targets: peers,
                chaincodePath: `/home/server/artifacts/src/github.com/example_cc/node`,
                chaincodeId: 'mycc',
                chaincodeVersion: 'v0',
                chaincodeType: 'node',
            };
            const results = await client.installChaincode(request as ChaincodeInstallRequest);
            // the returned object has both the endorsement results
            // and the actual proposal, the proposal will be needed
            // later when we send a transaction to the orederer
            const proposalResponses = results[0];
            const proposal = results[1];

            // lets have a look at the responses to see if they are
            // all good, if good they will also include signatures
            // required to be committed
            for (const i in proposalResponses as any) {
                if (proposalResponses[i] instanceof Error) {
                    errorMessage = `install proposal resulted in an error :: ${proposalResponses[i].toString()}`;
                    this.logger.info(errorMessage);
                } else if (proposalResponses[i].response && proposalResponses[i].response.status === 200) {
                    this.logger.info('install proposal was good');
                } else {
                    // allGood = false;
                    errorMessage = `install proposal was bad for an unknown reason ${proposalResponses[i]}`;
                    this.logger.info(errorMessage);
                }
            }
        } catch (error) {
            this.logger.error(`Failed to install due to error: ${error.stack ? error.stack : error}`);
            errorMessage = error.toString();
        }

        if (!errorMessage) {
            const message = `Successfully installed chaincode`;
            this.logger.info(message);
            // build a response to send back to the REST caller
            const response = {
                success: true,
                message,
            };
            return response;
        } else {
            const message = `Failed to install due to:${errorMessage}`;
            this.logger.info(message);
            const response = {
                success: false,
                message,
            };
            return response;
        }
    }

    public async instantiateChaincode(
        peers: string[],
        channelName: string,
        functionName: string,
        args: string[],
        username: string,
        orgName: string,
    ): Promise<Response> {
        this.logger.info(`\n\n============ Instantiate chaincode on channel ${channelName} ============`);
        let errorMessage = null;
        let client = null;
        let channel = null;
        try {
            // first setup the client for this org
            client = await this.clientService.getClientForOrg(orgName, username);
            this.logger.info(`Successfully got the fabric client for the organization '${orgName}`);
            channel = client.getChannel(channelName);
            if (!channel) {
                const message = `Channel ${channelName} was not defined in the connection profile`;
                this.logger.error(message);
                throw new Error(message);
            }
            const txId = client.newTransactionID(true); // Get an admin based transactionID
            // An admin based transactionID will
            // indicate that admin identity should
            // be used to sign the proposal request.
            // will need the transaction ID string for the event registration later
            const deployId = txId.getTransactionID();

            // send proposal to endorser
            const request = {
                'targets': peers,
                'chaincodeId': 'mycc',
                'chaincodeType': 'node',
                'chaincodeVersion': 'v0',
                args,
                txId,

                // Use this to demonstrate the following policy:
                // The policy can be fulfilled when members from both orgs signed.
                'endorsement-policy': {
                    identities: [
                        { role: { name: 'member', mspId: 'Org1MSP' } },
                        { role: { name: 'member', mspId: 'Org2MSP' } }
                    ],
                    policy: {
                        '2-of': [{ 'signed-by': 0 }, { 'signed-by': 1 }]
                    }
                }
            };
            if (functionName) {
                (request as any).fcn = functionName;
            }

            const results = await channel.sendInstantiateProposal(request, 60000); // instantiate takes much longer

            // the returned object has both the endorsement results
            // and the actual proposal, the proposal will be needed
            // later when we send a transaction to the orderer
            const proposalResponses = results[0];
            const proposal = results[1];

            // look at the responses to see if they are all are good
            // response will also include signatures required to be committed
            let allGood = true;
            for (const i in proposalResponses) {
                if (proposalResponses[i] instanceof Error) {
                    allGood = false;
                    errorMessage = `instantiate proposal resulted in an error :: ${proposalResponses[i].toString()}`;
                    this.logger.error(errorMessage);
                } else if (proposalResponses[i].response && proposalResponses[i].response.status === 200) {
                    this.logger.info('instantiate proposal was good');
                } else {
                    allGood = false;
                    errorMessage = format(`instantiate proposal was bad for an unknown reason %j`, proposalResponses[i]);
                    this.logger.error(errorMessage);
                }
            }

            if (allGood) {
                this.logger.info(`
                    Successfully sent Proposal and received ProposalResponse: Status - ${proposalResponses[0].response.status},
                    message - "${proposalResponses[0].response.message}",
                    metadata - "${proposalResponses[0].response.payload}",
                    endorsement signature: ${proposalResponses[0].endorsement.signature}
                `);

                // wait for the channel-based event hub to tell us that the
                // instantiate transaction was committed on the peer
                const promises = [];
                const eventHubs = channel.getChannelEventHubsForOrg();
                this.logger.info(`found ${eventHubs.length} eventhubs for this organization ${orgName}`);
                eventHubs.forEach((eh) => {
                    const instantiateEventPromise = new Promise((resolve, reject) => {
                        this.logger.info('instantiateEventPromise - setting up event');
                        const eventTimeout = setTimeout(() => {
                            this.logger.error(`REQUEST_TIMEOUT:${eh.getPeerAddr()}`);
                            eh.disconnect();
                        }, 60000);
                        eh.registerTxEvent(deployId, (tx, code, blockNum) => {
                            this.logger.info(`The chaincode instantiate transaction has been committed on peer ${eh.getPeerAddr()}`);
                            this.logger.info(`Transaction ${tx} has status of ${code} in block ${blockNum}`);
                            clearTimeout(eventTimeout);

                            if (code !== 'VALID') {
                                const message = `The chaincode instantiate transaction was invalid, code:${code}`;
                                this.logger.error(message);
                                reject(new Error(message));
                            } else {
                                const message = 'The chaincode instantiate transaction was valid.';
                                this.logger.info(message);
                                resolve(message);
                            }
                        }, (err) => {
                            clearTimeout(eventTimeout);
                            this.logger.error(err);
                            reject(err);
                        },
                            // the default for 'unregister' is true for transaction listeners
                            // so no real need to set here, however for 'disconnect'
                            // the default is false as most event hubs are long running
                            // in this use case we are using it only once
                            { unregister: true, disconnect: true }
                        );
                        eh.connect();
                    });
                    promises.push(instantiateEventPromise);
                });

                const ordererRequest = {
                    txId, // must include the transaction id so that the outbound
                    // transaction to the orderer will be signed by the admin id
                    // the same as the proposal above, notice that transactionID
                    // generated above was based on the admin id not the current
                    // user assigned to the 'client' instance.
                    proposalResponses,
                    proposal,
                };
                const sendPromise = channel.sendTransaction(ordererRequest);
                // put the send to the orderer last so that the events get registered and
                // are ready for the orderering and committing
                promises.push(sendPromise);
                const results = await Promise.all(promises);
                this.logger.info(format('------->>> R E S P O N S E : %j', results));
                const response = results.pop(); //  orderer results are last in the results
                if (response.status === 'SUCCESS') {
                    this.logger.info('Successfully sent transaction to the orderer.');
                } else {
                    errorMessage = `Failed to order the transaction. Error code: ${response.status}`;
                    this.logger.info(errorMessage);
                }

                // now see what each of the event hubs reported
                this.logger.info(format(`results %j`, results));
                for (let i = 0; i < results.length; i++) {
                    const eventHubResult = results[i];
                    this.logger.info(format(`eventHubResult %j`, eventHubResult));
                    const eventHub = eventHubs[i];
                    this.logger.info(`Event results for event hub :${eventHub.getPeerAddr()}`);
                    if (typeof eventHubResult === 'string') {
                        this.logger.info(eventHubResult);
                    } else {
                        if (!errorMessage) {
                            errorMessage = eventHubResult.toString();
                        }
                        this.logger.info(eventHubResult.toString());
                    }
                }
            }
        } catch (error) {
            this.logger.error(`Failed to send instantiate due to error: ${error.stack ? error.stack : error}`);
            errorMessage = error.toString();
        } finally {
            if (channel) {
                channel.close();
            }
        }
        let success = true;
        let message = `Successfully instantiate chaincode in organization ${orgName} to the channel '${channelName}'`;
        if (errorMessage) {
            message = `Failed to instantiate the chaincode. cause:${errorMessage}`;
            success = false;
            this.logger.error(message);
        } else {
            this.logger.info(message);
        }

        // build a response to send back to the REST caller
        const response: Response = {
            success,
            message,
        };
        return response;
    }


    public async invokeChaincode(
        peerNames: string[],
        channelName: string,
        chaincodeName: string,
        fcn: string,
        args: string[],
        username: string,
        orgName: string,
    ): Promise<Response> {
        this.logger.info(`\n============ invoke transaction on channel ${channelName} ============\n`);
        let errorMessage = null;
        let txIdString = null;
        let client = null;
        let channel = null;
        try {
            // first setup the client for this org
            client = await this.clientService.getClientForOrg(orgName, username);
            this.logger.info(`Successfully got the fabric client for the organization '${orgName}'`);
            channel = client.getChannel(channelName);
            if (!channel) {
                const message = `Channel ${channelName} was not defined in the connection profile`;
                this.logger.error(message);
                throw new Error(message);
            }
            const txId = client.newTransactionID();
            // will need the transaction ID string for the event registration later
            txIdString = txId.getTransactionID();

            // send proposal to endorser
            const request = {
                targets: peerNames,
                chaincodeId: chaincodeName,
                fcn,
                args,
                chainId: channelName,
                txId,
            };

            const results = await channel.sendTransactionProposal(request);

            // the returned object has both the endorsement results
            // and the actual proposal, the proposal will be needed
            // later when we send a transaction to the orderer
            const proposalResponses = results[0];
            const proposal = results[1];

            // look at the responses to see if they are all are good
            // response will also include signatures required to be committed
            let allGood = true;
            for (const i in proposalResponses) {
                if (proposalResponses[i] instanceof Error) {
                    allGood = false;
                    errorMessage = `invoke chaincode proposal resulted in an error :: ${proposalResponses[i].toString()}`;
                    this.logger.error(errorMessage);
                } else if (proposalResponses[i].response && proposalResponses[i].response.status === 200) {
                    this.logger.info('invoke chaincode proposal was good');
                } else {
                    allGood = false;
                    errorMessage = format(`invoke chaincode proposal failed for an unknown reason %j`, proposalResponses[i]);
                    this.logger.error(errorMessage);
                }
            }

            if (allGood) {
                this.logger.info(`
                    Successfully sent Proposal and received ProposalResponse: Status - ${proposalResponses[0].response.status},
                    message - "${proposalResponses[0].response.message}",
                    metadata - "${proposalResponses[0].response.payload}",
                    endorsement signature: ${proposalResponses[0].endorsement.signature}
                `);

                // wait for the channel-based event hub to tell us
                // that the commit was good or bad on each peer in our organization
                const promises = [];
                const eventHubs = channel.getChannelEventHubsForOrg();
                eventHubs.forEach((eh) => {
                    this.logger.info('invokeEventPromise - setting up event');
                    const invokeEventPromise = new Promise((resolve, reject) => {
                        const eventTimeout = setTimeout(() => {
                            const message = `REQUEST_TIMEOUT:${eh.getPeerAddr()}`;
                            this.logger.error(message);
                            eh.disconnect();
                        }, 3000);
                        eh.registerTxEvent(txIdString, (tx, code, blockNum) => {
                            this.logger.info(`The chaincode invoke chaincode transaction has been committed on peer ${eh.getPeerAddr()}`);
                            this.logger.info(`Transaction ${tx} has status of ${code} in block ${blockNum}`);
                            clearTimeout(eventTimeout);

                            if (code !== 'VALID') {
                                const message = `The invoke chaincode transaction was invalid, code:${code}`;
                                this.logger.error(message);
                                reject(new Error(message));
                            } else {
                                const message = 'The invoke chaincode transaction was valid.';
                                this.logger.info(message);
                                resolve(message);
                            }
                        }, (err) => {
                            clearTimeout(eventTimeout);
                            this.logger.error(err);
                            reject(err);
                        },
                            // the default for 'unregister' is true for transaction listeners
                            // so no real need to set here, however for 'disconnect'
                            // the default is false as most event hubs are long running
                            // in this use case we are using it only once
                            { unregister: true, disconnect: true }
                        );
                        eh.connect();
                    });
                    promises.push(invokeEventPromise);
                });

                const ordererRequest = {
                    txId,
                    proposalResponses,
                    proposal,
                };
                const sendPromise = channel.sendTransaction(ordererRequest);
                // put the send to the orderer last so that the events get registered and
                // are ready for the orderering and committing
                promises.push(sendPromise);
                const results = await Promise.all(promises);
                this.logger.info(format('------->>> R E S P O N S E : %j', results));
                const response = results.pop(); //  orderer results are last in the results
                if (response.status === 'SUCCESS') {
                    this.logger.info('Successfully sent transaction to the orderer.');
                } else {
                    errorMessage = format('Failed to order the transaction. Error code: %s', response.status);
                    this.logger.info(errorMessage);
                }

                // now see what each of the event hubs reported
                for (let i = 0; i < results.length; i++) {
                    const eventHubResult = results[i];
                    const eventHub = eventHubs[i];
                    this.logger.info(`Event results for event hub :${eventHub.getPeerAddr()}`);
                    if (typeof eventHubResult === 'string') {
                        this.logger.info(eventHubResult);
                    } else {
                        if (!errorMessage) {
                            errorMessage = eventHubResult.toString();
                        }
                        this.logger.info(eventHubResult.toString());
                    }
                }
            }
        } catch (error) {
            this.logger.error('Failed to invoke due to error: ' + error.stack ? error.stack : error);
            errorMessage = error.toString();
        } finally {
            if (channel) {
                channel.close();
            }
        }

        let success = true;
        let message = format(
            'Successfully invoked the chaincode %s to the channel \'%s\' for transaction ID: %s',
            orgName, channelName, txIdString);
        if (errorMessage) {
            message = format('Failed to invoke chaincode. cause:%s', errorMessage);
            success = false;
            this.logger.error(message);
        } else {
            this.logger.info(message);
        }

        // build a response to send back to the REST caller
        const response: Response = {
            success,
            message,
        };
        return response;

    }
    public async queryChaincode(
        peer: string,
        channelName: string,
        chaincodeName: string,
        args: string[],
        fcn: string,
        username: string,
        orgName: string): Promise<string> {
        let client = null;
        let channel = null;
        try {
            // first setup the client for this org
            client = await this.clientService.getClientForOrg(orgName, username);
            this.logger.debug('Successfully got the fabric client for the organization "%s"', orgName);
            channel = client.getChannel(channelName);
            if (!channel) {
                let message = format('Channel %s was not defined in the connection profile', channelName);
                this.logger.error(message);
                throw new Error(message);
            }

            // send query
            const request = {
                targets: [peer], //queryByChaincode allows for multiple targets
                chaincodeId: chaincodeName,
                fcn,
                args,
            };
            const responsePayloads = await channel.queryByChaincode(request);
            if (responsePayloads) {
                for (let i = 0; i < responsePayloads.length; i++) {
                    this.logger.info(args[0] + ' now has ' + responsePayloads[i].toString('utf8') +
                        ' after the move');
                }
                return args[0] + ' now has ' + responsePayloads[0].toString('utf8') +
                    ' after the move';
            } else {
                this.logger.error('responsePayloads is null');
                return 'responsePayloads is null';
            }
        } catch (error) {
            this.logger.error('Failed to query due to error: ' + error.stack ? error.stack : error);
            return error.toString();
        } finally {
            if (channel) {
                channel.close();
            }
        }
    }
    public async getBlockByNumber(
        peer: string,
        channelName: string,
        blockNumber: number,
        username: string,
        orgName: string): Promise<any> {
        try {
            // first setup the client for this org
            const client = await this.clientService.getClientForOrg(orgName, username);
            this.logger.debug('Successfully got the fabric client for the organization "%s"', orgName);
            const channel = client.getChannel(channelName);
            if (!channel) {
                let message = format('Channel %s was not defined in the connection profile', channelName);
                this.logger.error(message);
                throw new Error(message);
            }

            const responsePayload = await channel.queryBlock(parseInt(`${blockNumber}`, +peer));
            if (responsePayload) {
                this.logger.debug(responsePayload);
                return responsePayload;
            } else {
                this.logger.error('responsePayload is null');
                return 'responsePayload is null';
            }
        } catch (error) {
            this.logger.error('Failed to query due to error: ' + error.stack ? error.stack : error);
            return error.toString();
        }
    }
    public async getTransactionByID(
        peer: string,
        channelName: string,
        trxnID: string,
        username: string,
        orgName: string): Promise<any> {
        try {
            // first setup the client for this org
            const client = await this.clientService.getClientForOrg(orgName, username);
            this.logger.info('Successfully got the fabric client for the organization "%s"', orgName);
            const channel = client.getChannel(channelName);
            if (!channel) {
                let message = format('Channel %s was not defined in the connection profile', channelName);
                this.logger.error(message);
                throw new Error(message);
            }
            const responsePayload = await channel.queryTransaction(trxnID, peer);
            if (responsePayload) {
                this.logger.info(responsePayload);
                return responsePayload;
            } else {
                this.logger.error('responsePayload is null');
                return 'responsePayload is null';
            }
        } catch (error) {
            this.logger.error('Failed to query due to error: ' + error.stack ? error.stack : error);
            return error.toString();
        }
    }
    public async getBlockByHash(
        peer: string,
        channelName: string,
        hash: string,
        username: string,
        orgName: string): Promise<any> {
        try {
            // first setup the client for this org
            const client = await this.clientService.getClientForOrg(orgName, username);
            this.logger.debug('Successfully got the fabric client for the organization "%s"', orgName);
            const channel = client.getChannel(channelName);
            if (!channel) {
                let message = format('Channel %s was not defined in the connection profile', channelName);
                this.logger.error(message);
                throw new Error(message);
            }

            const responsePayload = await channel.queryBlockByHash(Buffer.from(hash, 'hex'), peer);
            if (responsePayload) {
                this.logger.debug(responsePayload);
                return responsePayload;
            } else {
                this.logger.error('responsePayload is null');
                return 'responsePayload is null';
            }
        } catch (error) {
            this.logger.error('Failed to query due to error: ' + error.stack ? error.stack : error);
            return error.toString();
        }

    }
    public async getChainInfo(
        peer: string,
        channelName: string,
        username: string,
        orgName: string): Promise<any> {
        try {
            // first setup the client for this org
            const client = await this.clientService.getClientForOrg(orgName, username);
            this.logger.debug('Successfully got the fabric client for the organization "%s"', orgName);
            const channel = client.getChannel(channelName);
            if (!channel) {
                let message = format('Channel %s was not defined in the connection profile', channelName);
                this.logger.error(message);
                throw new Error(message);
            }

            const responsePayload = await channel.queryInfo(peer);
            if (responsePayload) {
                this.logger.debug(responsePayload);
                return responsePayload;
            } else {
                this.logger.error('responsePayload is null');
                return 'responsePayload is null';
            }
        } catch (error) {
            this.logger.error('Failed to query due to error: ' + error.stack ? error.stack : error);
            return error.toString();
        }
    }

    public async getInstalledChaincodes (
        peer: string,
        channelName: string,
        type: string,
        username: string,
        orgName: string): Promise<any> {
        try {
            // first setup the client for this org
            const client = await this.clientService.getClientForOrg(orgName, username);
            this.logger.debug('Successfully got the fabric client for the organization "%s"', orgName);
            let response = null
            if (type === 'installed') {
                response = await client.queryInstalledChaincodes(peer, true); //use the admin identity
            } else {
                const channel = client.getChannel(channelName);
                if(!channel) {
                    const message = format('Channel %s was not defined in the connection profile', channelName);
                    this.logger.error(message);
                    throw new Error(message);
                }
                response = await channel.queryInstantiatedChaincodes(peer, true); //use the admin identity
            }
            if (response) {
                if (type === 'installed') {
                    this.logger.debug('<<< Installed Chaincodes >>>');
                } else {
                    this.logger.debug('<<< Instantiated Chaincodes >>>');
                }
                let details = [];
                for (let i = 0; i < response.chaincodes.length; i++) {
                    this.logger.debug('name: ' + response.chaincodes[i].name + ', version: ' +
                        response.chaincodes[i].version + ', path: ' + response.chaincodes[i].path
                    );
                    details.push('name: ' + response.chaincodes[i].name + ', version: ' +
                        response.chaincodes[i].version + ', path: ' + response.chaincodes[i].path
                    );
                }
                return details;
            } else {
                this.logger.error('response is null');
                return 'response is null';
            }
        } catch(error) {
            this.logger.error('Failed to query due to error: ' + error.stack ? error.stack : error);
            return error.toString();
        }

    }

}
