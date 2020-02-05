import { Injectable } from '@nestjs/common';
import User, { Organization } from '../entity/User.entity';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { FabricService } from '../fabric/fabric.service';

@Injectable()
export class UserService {
    constructor(
        @InjectRepository(User) private readonly userRepository: Repository<User>,
        private readonly fabricService: FabricService,
    ) { }

    public async createUser(name: string, organization: Organization, smartMeterId: string): Promise<User> {
        const user = new User();
        user.name = name;
        user.organization = organization;
        user.smartMeterId = smartMeterId;
        await this.userRepository.save(user);
        await this.fabricService.createUser(user.id, user.organization);
        return user;
    }

    public async findOne(id: string): Promise<User> {
        return this.userRepository.findOne(id);
    }

}
