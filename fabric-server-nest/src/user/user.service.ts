import { Injectable } from '@nestjs/common';
import { TypeOrmCrudService } from '@nestjsx/crud-typeorm';
import User from '../entity/User.entity';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';

@Injectable()
export class UserService extends TypeOrmCrudService<User> {
    constructor(@InjectRepository(User) userRepository: Repository<User>) {
        super(userRepository);
    }
} 
