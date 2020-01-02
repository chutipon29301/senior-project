import { Repository } from 'typeorm';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { TypeOrmCrudService } from '@nestjsx/crud-typeorm';
import Round from '../entity/Round.entity';

@Injectable()
export class RoundService extends TypeOrmCrudService<Round> {
    constructor(@InjectRepository(Round) roundRepository: Repository<Round>) {
        super(roundRepository);
    }
}
