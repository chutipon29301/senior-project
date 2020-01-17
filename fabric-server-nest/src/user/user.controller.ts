import { Controller, Post, Body } from '@nestjs/common';
import { CrudController, Crud } from '@nestjsx/crud';
import User from '../entity/User.entity';
import { UserService } from './user.service';
import { CreateUserDto } from './user.dto';

@Crud({
    model: {
        type: User,
    },
})
@Controller('user')
export class UserController implements CrudController<User> {
    constructor(readonly service: UserService) { }

    @Post('create')
    public async createUser(@Body() { name, organizationName }: CreateUserDto): Promise<User> {
        return this.service.createUser(name, organizationName);
    }

}
