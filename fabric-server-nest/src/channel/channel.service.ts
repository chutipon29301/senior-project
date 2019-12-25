import { Injectable, BadRequestException } from '@nestjs/common';
import { ClientService } from '../client/client.service';
import { readFileSync } from 'fs';
import { ChannelRequest } from 'fabric-client';
@Injectable()
export class ChannelService {

    constructor(private readonly clientService: ClientService) { }

    public async createChannel(channelName: string, username: string, orgName: string) {
        console.log(`\n====== Creating Channel '${channelName}' ======\n`);
        try {
            // first setup the client for this org
            const client = await this.clientService.getClientForOrg(orgName);
            console.log(`Successfully got the fabric client for the organization ${orgName}`);

            // read in the envelope for the channel config raw bytes
            const envelope = readFileSync('/home/server/artifacts/channel/mychannel.tx');
            // extract the channel config bytes from the envelope to be signed
            const channelConfig = client.extractChannelConfig(envelope);

            // Acting as a client in the given organization provided with "orgName" param
            // sign the channel config bytes as "endorsement", this is required by
            // the orderer's channel creation policy
            // this will use the admin identity assigned to the client when the connection profile was loaded
            const signature = client.signChannelConfig(channelConfig);

            const request = {
                config: channelConfig,
                signatures: [signature],
                name: channelName,
                txId: client.newTransactionID(true) // get an admin based transactionID
            };

            // send to orderer
            const result = await client.createChannel(request as ChannelRequest);
            console.log(`result ::${result}`);
            if (result) {
                if (result.status === 'SUCCESS') {
                    console.log('Successfully created the channel.');
                    const response = {
                        success: true,
                        message: `Channel '${channelName}' created Successfully`,
                    };
                    return response;
                } else {
                    console.log(`Failed to create the channel. status: ${result.status} reason:${result.info}`);
                    const response = {
                        success: false,
                        message: `Channel '${channelName}' failed to create status: ${result.status} reason:${result.info}`,
                    };
                    return response;
                }
            } else {
                console.log(`\n!!!!!!!!! Failed to create the channel '${channelName}' !!!!!!!!!\n\n`);
                const response = {
                    success: false,
                    message: `Failed to create the channel '${channelName}'`,
                };
                return response;
            }
        } catch (err) {
            console.log(`Failed to initialize the channel: ${err.stack ? err.stack : err}`);
            throw new BadRequestException('Failed to initialize the channel: ' + err.toString());
        }
    }
    public async joinChannel()
}
