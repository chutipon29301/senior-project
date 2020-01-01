import { Injectable, BadRequestException, Inject } from '@nestjs/common';
import * as Client from 'fabric-client';
import { WINSTON } from '../constant';
import { Logger } from 'winston';

@Injectable()
export class ClientService {

    constructor(@Inject(WINSTON) private readonly logger: Logger) {}

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
