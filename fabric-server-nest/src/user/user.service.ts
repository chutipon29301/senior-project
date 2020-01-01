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

    // public async enrollUser(username: string, organizationName: string) {

    // }

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
            throw new BadRequestException('User was not enrolled')
        }
    }

    // public async registerUser(username: string, orgName: string) {
    //     const token = this.jwtService.sign({
    //         username,
    //         orgName,
    //     }, {
    //         expiresIn: '2days',
    //     });
    //     const response = await this.getRegisteredUser(username, orgName, true);
    //     this.logger.debug(`-- returned from registering the username ${username} for organization ${orgName}`);
    //     if (response && typeof response !== 'string') {
    //         this.logger.debug(`Successfully registered the username ${username} for organization ${orgName}`);
    //         return { ...response, token };
    //     } else {
    //         this.logger.debug(`Failed to register the username ${username} for organization ${orgName} with ::${response}`);
    //         throw new BadRequestException(response);
    //     }
    // }

    // public async getRegisteredUser(username: string, userOrg: string, isJson: boolean): Promise<Response> {
    //     try {
    //         const client = await this.clientService.getClientForOrg(userOrg);
    //         this.logger.debug('Successfully initialized the credential stores');
    //         let user = await client.getUserContext(username, true);
    //         if (user && user.isEnrolled()) {
    //             this.logger.debug('Successfully loaded member from persistence');
    //         } else {
    //             this.logger.debug(`User ${username} was not enrolled, so we will need an admin user object to register`);
    //             const adminUserObj = await client.setUserContext({ username: 'admin', password: 'adminpw' });
    //             const caClient = client.getCertificateAuthority();
    //             const secret = await caClient.register({
    //                 enrollmentID: username,
    //                 affiliation: userOrg.toLowerCase() + '.department1',
    //             }, adminUserObj);
    //             this.logger.debug(`Successfully got the secret for user ${username}`);
    //             user = await client.setUserContext({ username, password: secret });
    //             this.logger.debug(`Successfully enrolled username ${username}  and setUserContext on the client object`);
    //         }
    //         if (user && user.isEnrolled) {
    //             if (isJson && isJson === true) {
    //                 const response: Response = {
    //                     success: true,
    //                     secret: (user as any)._enrollmentSecret,
    //                     message: username + ' enrolled Successfully',
    //                 };
    //                 return response;
    //             }
    //         } else {
    //             throw new BadRequestException('User was not enrolled ');
    //         }
    //     } catch (error) {
    //         throw new BadRequestException(error);
    //     }

    // }

}
