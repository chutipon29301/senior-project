import { Injectable } from '@nestjs/common';
import User, { Organization } from '../entity/User.entity';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { FabricService } from '../fabric/fabric.service';
import { ConfigService } from '../config/config.service';

@Injectable()
export class UserService {
    constructor(
        @InjectRepository(User) private readonly userRepository: Repository<User>,
        private readonly fabricService: FabricService,
        private readonly configService: ConfigService,
    ) { }

    public async createUser(name: string, organization: Organization, smartMeterId: string): Promise<User> {
        const user = new User();
        user.name = name;
        user.organization = organization;
        user.smartMeterId = smartMeterId;
        await this.userRepository.save(user);
        if (this.configService.useFabric) {
            await this.fabricService.createUser(user.id, user.organization);
        }
        return user;
    }

    public async findOne(id: string): Promise<User> {
        return this.userRepository.findOne(id);
    }

    public async listUsers(): Promise<User[]> {
        return this.userRepository.find();
    }

}
