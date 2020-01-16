import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import User from '../entity/User.entity';
import { UserService } from '../user/user.service';
import { JwtToken } from './auth.dto';

@Injectable()
export class AuthService {
    constructor(
        private readonly jwtService: JwtService,
        private readonly userService: UserService,
    ) { }

    public async decodeToken(token: string): Promise<User | null> {
        try {
            const decodeUser = this.jwtService.decode(token) as User;
            const user = await this.userService.findOne(decodeUser.id);
            if (user) {
                return user;
            }
            // tslint:disable-next-line: no-empty
        } catch (_) { }
        return null;
    }

    public async getTokenFromId(id: string): Promise<JwtToken> {
        const user = await this.userService.findOne(id);
        return {
            token: this.jwtService.sign(JSON.parse(JSON.stringify(user))),
        };
    }
}
