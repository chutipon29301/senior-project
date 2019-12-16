import { Injectable } from '@nestjs/common';
import { ClientService } from '../client/client.service';
import { readFileSync } from 'fs';

@Injectable()
export class ChannelService {

    constructor(private readonly clientService: ClientService) {}

    public async createChannel(channelName: string, orgName: string) {
        const client = await this.clientService.getClientForOrg(orgName);
        const envelope = readFileSync('/home/fabric/config/channel.tx');
        const channelConfig = client.extractChannelConfig(envelope);
        const signature = client.signChannelConfig(channelConfig);
        // const request = {
        //     config: channelConfig,
        //     signatures: [signature],
        //     name: channelName,
        //     txId: client.newTransactionID(true),
        // };
        const result = await client.createChannel({
            config: channelConfig,
            signatures: [signature],
            name: channelName,
            envelope,
            txId: client.newTransactionID(true),
            orderer: client.getOrderer('orderer.example.com'),
        });

        if (result) {
            if (result.status === 'SUCCESS') {
                const response = {
                    success: true,
                    message: 'Channel \'' + channelName + '\' created Successfully'
                };
                return response;
            } else {
                const response = {
                    success: false,
                    message: 'Channel \'' + channelName + '\' failed to create status:' + result.status + ' reason:' + result.info
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
}
