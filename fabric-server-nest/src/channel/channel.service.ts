import { Injectable, BadRequestException, Inject } from '@nestjs/common';
import { ClientService } from '../client/client.service';
import { readFileSync } from 'fs';
import { ChannelRequest, OrdererRequest, ProposalResponse, BroadcastResponse } from 'fabric-client';
import { join } from 'path';
import { WINSTON } from '../constant';
import { Logger } from 'winston';

@Injectable()
export class ChannelService {

    constructor(
        @Inject(WINSTON) private readonly logger: Logger,
        private readonly clientService: ClientService,
    ) { }

    public async createChannel(channelName: string, username: string, organizationName: string) {
        this.logger.info(`====== Creating Channel '${channelName}' ======`);
        // Setup client for organization
        const client = await this.clientService.getClientForOrg(organizationName);
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
        const client = await this.clientService.getClientForOrg(organizationName, username);
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
        const client = await this.clientService.getClientForOrg(organizationName, username);
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

    // public async updateAnchorPeers(channelName: string, configUpdatePath: string, username: string, orgName: string) {
    //     this.logger.debug(`\n====== Updating Anchor Peers on '${channelName}' ======\n`);
    //     let errorMessage = null;
    //     try {
    //         // first setup the client for this org
    //         const client = await this.clientService.getClientForOrg(orgName, username);
    //         this.logger.debug(`Successfully got the fabric client for the organization '${orgName}'`);
    //         const channel = client.getChannel(channelName);
    //         if (!channel) {
    //             const message = `Channel ${channelName} was not defined in the connection profile`;
    //             this.logger.error(message);
    //             throw new Error(message);
    //         }

    //         // read in the envelope for the channel config raw bytes
    //         const envelope = readFileSync(join('/home/server/artifacts/channel', configUpdatePath));
    //         // extract the channel config bytes from the envelope to be signed
    //         const channelConfig = client.extractChannelConfig(envelope);

    //         // Acting as a client in the given organization provided with "orgName" param
    //         // sign the channel config bytes as "endorsement", this is required by
    //         // the orderer's channel creation policy
    //         // this will use the admin identity assigned to the client when the connection profile was loaded
    //         const signature = client.signChannelConfig(channelConfig);

    //         const request = {
    //             config: channelConfig,
    //             signatures: [signature],
    //             name: channelName,
    //             txId: client.newTransactionID(true), // get an admin based transactionID
    //         };

    //         const promises = [];
    //         const eventHubs = channel.getChannelEventHubsForOrg();
    //         this.logger.debug(`found ${eventHubs.length} eventhubs for this organization ${orgName}`);
    //         eventHubs.forEach((eh) => {
    //             const anchorUpdateEventPromise = new Promise((resolve, reject) => {
    //                 this.logger.debug('anchorUpdateEventPromise - setting up event');
    //                 const eventTimeout = setTimeout(() => {
    //                     const message = 'REQUEST_TIMEOUT:' + eh.getPeerAddr();
    //                     this.logger.debug(message);
    //                     eh.disconnect();
    //                 }, 60000);
    //                 eh.registerBlockEvent((block) => {
    //                     this.logger.debug(`The config update has been committed on peer ${eh.getPeerAddr()}`);
    //                     clearTimeout(eventTimeout);
    //                     resolve();
    //                 }, (err) => {
    //                     clearTimeout(eventTimeout);
    //                     this.logger.debug(err);
    //                     reject(err);
    //                 },
    //                     // the default for 'unregister' is true for block listeners
    //                     // so no real need to set here, however for 'disconnect'
    //                     // the default is false as most event hubs are long running
    //                     // in this use case we are using it only once
    //                     { unregister: true, disconnect: true },
    //                 );
    //                 eh.connect();
    //             });
    //             promises.push(anchorUpdateEventPromise);
    //         });

    //         const sendPromise = client.updateChannel(request as ChannelRequest);
    //         // put the send to the orderer last so that the events get registered and
    //         // are ready for the orderering and committing
    //         promises.push(sendPromise);
    //         const results = await Promise.all(promises);
    //         this.logger.debug(`------->>> R E S P O N S E :${results}`);
    //         const response = results.pop(); //  orderer results are last in the results

    //         if (response) {
    //             if (response.status === 'SUCCESS') {
    //                 this.logger.debug(`Successfully update anchor peers to the channel ${channelName}`);
    //             } else {
    //                 errorMessage = `Failed to update anchor peers to the channel
    //                 ${channelName} with status: ${response.status} reason: ${response.info}`;
    //                 this.logger.debug(errorMessage);
    //             }
    //         } else {
    //             errorMessage = `Failed to update anchor peers to the channel ${channelName}`;
    //             this.logger.debug(errorMessage);
    //         }
    //     } catch (error) {
    //         this.logger.error(error.toString());
    //         throw new BadRequestException('Failed to update anchor peers due to error: ' + error.stack ? error.stack : error);
    //     }

    //     if (!errorMessage) {
    //         const message = `Successfully update anchor peers in organization ${orgName} to the channel ${channelName}`;
    //         this.logger.debug(message);
    //         const response = {
    //             success: true,
    //             message,
    //         };
    //         return response;
    //     } else {
    //         const message = `Failed to update anchor peers. cause:${errorMessage}`;
    //         this.logger.debug(message);
    //         const response = {
    //             success: false,
    //             message,
    //         };
    //         return response;
    //     }

    // }

    // public async getChannels(peer: string, username: string, orgName: string) {
    //     try {
    //         // first setup the client for this org
    //         const client = await this.clientService.getClientForOrg(orgName, username);
    //         this.logger.debug('Successfully got the fabric client for the organization "%s"', orgName);
    //         const response = await client.queryChannels(peer);
    //         if (response) {
    //             this.logger.debug('<<< channels >>>');
    //             let channelNames = [];
    //             for (let i = 0; i < response.channels.length; i++) {
    //                 channelNames.push('channel id: ' + response.channels[i].channel_id);
    //             }
    //             this.logger.debug(channelNames);
    //             return response;
    //         } else {
    //             this.logger.error('response_payloads is null');
    //             return 'response_payloads is null';
    //         }
    //     } catch(error) {
    //         this.logger.error('Failed to query due to error: ' + error.stack ? error.stack : error);
    //         return error.toString();
    //     }
    // }
}
