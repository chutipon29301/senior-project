import { Controller, Post, Body, Get } from '@nestjs/common';
import User from '../entity/User.entity';
import { UserService } from './user.service';
import { CreateUserDto } from './user.dto';

@Controller('user')
export class UserController {
    constructor(readonly service: UserService) { }

    @Get()
    public async listUser(): Promise<User[]> {
        return this.service.listUsers()
    }

    @Post()
    public async createUser(@Body() { name, organizationName, smartMeterId }: CreateUserDto): Promise<User> {
        return this.service.createUser(name, organizationName, smartMeterId);
    }

}
