import { Injectable } from '@nestjs/common';
import { ClientService } from '../client/client.service';
import { readFileSync } from 'fs';
import { ChannelRequest, ChannelInfo } from 'fabric-client';

@Injectable()
export class ChannelService {

    constructor(private readonly clientService: ClientService) {}

    public async createChannel(channelName: string, orgName: string) {
        const client = await this.clientService.getClientForOrg(orgName);
        const envelope = readFileSync('/home/fabric/config/channel.tx');
        const channelConfig = client.extractChannelConfig(envelope);
        const signature = client.signChannelConfig(channelConfig);
        const orderer = client.getOrderer('orderer.example.com');
        // const request = {
        //     config: channelConfig,
        //     signatures: [signature],
        //     name: channelName,
        //     txId: client.newTransactionID(true),
        // };
        console.log(orderer);
        console.log(orderer.getName());
        const request = {
            config: channelConfig,
            signatures: [signature],
            name: channelName,
            envelope,
            txId: client.newTransactionID(true),
            // orderer,
        } as ChannelRequest;
        // console.log(request);
        const result = await client.createChannel(request);
        console.log('Hellooooo');

        if (result) {
            if (result.status === 'SUCCESS') {
                const response = {
                    success: true,
                    message: 'Channel \'' + channelName + '\' created Successfully',
                };
                return response;
            } else {
                const response = {
                    success: false,
                    message: 'Channel \'' + channelName + '\' failed to create status:' + result.status + ' reason:' + result.info,
                };
                return response;
            }
        } else {
            const response = {
                success: false,
                message: 'Failed to create the channel \'' + channelName + '\'',
            };
            return response;
        }
    }

    public async getChannels(): Promise<ChannelInfo[]> {
        const client = await this.clientService.getClientForOrg('org1', 'peer0.org1.example.com');
        const response = await client.queryChannels('peer0.org1.example.com');
        return response.channels;
    }
}
