import { Controller, Get, Param, Post, Body } from '@nestjs/common';
import { UserService } from './user.service';
import { RegisterAndEnrollUserDto } from './user.dto';

@Controller('user')
export class UserController {

    constructor(private readonly userService: UserService) {}

    @Get('register/:username/:userOrg/:isJson')
    public async getRegisterUser(@Param('username') username: string, @Param('userOrg') userOrg: string, @Param('isJson') isJson: string) {
        return this.userService.getRegisteredUser(username, userOrg, isJson === 'true');
    }

    @Post()
    public async registerAndEnrollUser(@Body() body: RegisterAndEnrollUserDto) {
        return this.userService.registerUser(body.username, body.orgName);
    }

}
