import { Injectable, BadRequestException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as Client from 'fabric-client';
import { ClientService } from '../client/client.service';
import { Response } from './user.dto';
@Injectable()
export class UserService {
    constructor(
        private readonly jwtService: JwtService,
        private readonly clientService: ClientService,
    ) { }

    public async registerUser(username: string, orgName: string) {
        const token = this.jwtService.sign({
            username,
            orgName,
        }, {
            expiresIn: '2days',
        });
        const response = await this.getRegisteredUser(username, orgName, true);
        console.log(`-- returned from registering the username ${username} for organization ${orgName}`);
        if (response && typeof response !== 'string') {
            console.log(`Successfully registered the username ${username} for organization ${orgName}`);
            return { ...response, token };
        } else {
            console.log(`Failed to register the username ${username} for organization ${orgName} with ::${response}`);
            throw new BadRequestException(response);
        }
    }

    public async getRegisteredUser(username: string, userOrg: string, isJson: boolean): Promise<Response> {
        try {
            const client = await this.clientService.getClientForOrg(userOrg);
            console.log('Successfully initialized the credential stores');
            let user = await client.getUserContext(username, true);
            if (user && user.isEnrolled()) {
                console.log('Successfully loaded member from persistence');
            } else {
                console.log(`User ${username} was not enrolled, so we will need an admin user object to register`);
                const adminUserObj = await client.setUserContext({ username: 'admin', password: 'adminpw' });
                const caClient = client.getCertificateAuthority();
                const secret = await caClient.register({
                    enrollmentID: username,
                    affiliation: userOrg.toLowerCase() + '.department1',
                }, adminUserObj);
                console.log(`Successfully got the secret for user ${username}`);
                user = await client.setUserContext({ username, password: secret });
                console.log(`Successfully enrolled username ${username}  and setUserContext on the client object`);
            }
            if (user && user.isEnrolled) {
                if (isJson && isJson === true) {
                    const response: Response = {
                        success: true,
                        secret: (user as any)._enrollmentSecret,
                        message: username + ' enrolled Successfully',
                    };
                    return response;
                }
            } else {
                throw new BadRequestException('User was not enrolled ');
            }
        } catch (error) {
            throw new BadRequestException(error);
        }

    }

}
