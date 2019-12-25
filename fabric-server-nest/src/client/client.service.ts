import { Injectable, BadRequestException } from '@nestjs/common';
import * as Client from 'fabric-client';

@Injectable()
export class ClientService {

    public async getClientForOrg(userOrg: string, username?: string): Promise<Client> {
        const client = Client.loadFromConfig('/home/server/artifacts/network-config.yaml');
        client.loadFromConfig(`/home/server/artifacts/${userOrg.toLowerCase()}.yaml`);
        await client.initCredentialStores();
        if (username) {
            const user = await client.getUserContext(username, true);
            if (!user) {
                throw new BadRequestException(`User was not found : ${username}`);
            } else {
                console.log('User %s was found to be registered and enrolled', username);
            }
        }
        console.log('getClientForOrg - ****** END %s %s \n\n', userOrg, username);
        return client;
    }

}
