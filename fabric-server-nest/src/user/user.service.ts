import { Injectable, BadRequestException, Inject } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as Client from 'fabric-client';
import { ClientService } from '../client/client.service';
import { Response } from './user.dto';
import { WINSTON } from '../constant';
import { Logger } from 'winston';

@Injectable()
export class UserService {
    constructor(
        @Inject(WINSTON) private readonly logger: Logger,
        private readonly jwtService: JwtService,
        private readonly clientService: ClientService,
    ) { }

    public async findOneOrCreate(username: string, organizationName: string) {
        const client = await this.clientService.getClientForOrg(organizationName);
        this.logger.info('Successfully initialized the credential stores');
        let user = await client.getUserContext(username, true);
        if (!(user && user.isEnrolled())) {
            // Create new user if not enrolled
            this.logger.debug(`User ${username} was not enrolled, so we will need an admin user object to register`);
            const adminUser = await client.setUserContext({ username: 'admin', password: 'adminpw' });
            const caClient = client.getCertificateAuthority();
            const secret = await caClient.register({
                enrollmentID: username,
                affiliation: `${organizationName.toLowerCase()}.department1`,
            }, adminUser);
            user = await client.setUserContext({ username, password: secret });
        }
        if (!(user && user.isEnrolled())) {
            throw new BadRequestException('User was not enrolled');
        }
    }

}
