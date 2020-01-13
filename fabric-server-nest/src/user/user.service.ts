import { Injectable } from '@nestjs/common';
import { TypeOrmCrudService } from '@nestjsx/crud-typeorm';
import User, { Organization } from '../entity/User.entity';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { FabricService } from '../fabric/fabric.service';

@Injectable()
export class UserService extends TypeOrmCrudService<User> {
    constructor(
        @InjectRepository(User) private readonly userRepository: Repository<User>,
        private readonly fabricService: FabricService,
    ) {
        super(userRepository);
    }

    public async createUser(name: string, organization: Organization): Promise<User> {
        const user = new User();
        user.name = name;
        user.organization = organization;
        await this.userRepository.save(user);
        await this.fabricService.createUser(user.id, user.organization);
        return user;
    }

}
