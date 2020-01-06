import { Controller, Post } from '@nestjs/common';
import { CrudController, Crud } from '@nestjsx/crud';
import User from '../entity/User.entity';
import { UserService } from './user.service';

@Crud({
    model: {
        type: User,
    },
})
@Controller('user')
export class UserController implements CrudController<User> {
    constructor(readonly service: UserService) { }

    @Post()
    public async createUser() {
        
    }

}
