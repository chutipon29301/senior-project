import { Injectable, BadRequestException } from '@nestjs/common';
import * as Client from 'fabric-client';
import { loadFromConfig } from 'fabric-client';

@Injectable()
export class ClientService {

    public async getClientForOrg(orgName: string, username?: string): Promise<Client> {
        const client = loadFromConfig('/home/fabric/network-config.yml');
        client.loadFromConfig(`/home/fabric/${orgName}.yml`);
        await client.initCredentialStores();
        if (username) {
            const user = await client.getUserContext(username, true);
            if (!user) {
                throw new BadRequestException('User not found');
            }
        }
        return client;
        // channelName: mychannel
        // channelConfigPath: /home/fabric/config/channel.tx
        // orgName: Org1
    }

}
