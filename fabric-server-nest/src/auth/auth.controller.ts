import { Controller, Post, Body, Get } from '@nestjs/common';
import { JwtToken, CreateTokenDto } from './auth.dto';
import { AuthService } from './auth.service';
import { Orgs } from '../decorator/org.decorator';
import User, { Organization } from '../entity/User.entity';
import { RequestUser } from '../decorator/user.decorator';

@Controller('auth')
export class AuthController {

    constructor(private readonly authService: AuthService) { }

    @Post('token')
    public async getToken(@Body() { id }: CreateTokenDto): Promise<JwtToken> {
        return this.authService.getTokenFromId(id);
    }

    @Orgs()
    @Get('user')
    public async getCurrentUser(@RequestUser() user: User) {
        return user;
    }

    @Orgs()
    @Get('ping')
    public async ping() {
        return 'pong';
    }

    @Orgs(Organization.Building)
    @Get('pingBuilding')
    public async pingBuilding() {
        return 'pong';
    }

    @Orgs(Organization.PV)
    @Get('pingPV')
    public async pingPV() {
        return 'pong';
    }
    @Orgs(Organization.Utility)
    @Get('pingUtility')
    public async pingUtility() {
        return 'pong';
    }

}
