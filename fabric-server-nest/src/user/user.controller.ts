import { Controller, Post, Body } from '@nestjs/common';
import User from '../entity/User.entity';
import { UserService } from './user.service';
import { CreateUserDto } from './user.dto';

@Controller('user')
export class UserController {
    constructor(readonly service: UserService) { }

    @Post()
    public async createUser(@Body() { name, organizationName }: CreateUserDto): Promise<User> {
        return this.service.createUser(name, organizationName);
    }

}
