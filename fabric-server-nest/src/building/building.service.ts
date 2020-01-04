import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import Building from '../entity/Building.entity';
import { Repository } from 'typeorm';
import { TypeOrmCrudService } from '@nestjsx/crud-typeorm';

@Injectable()
export class BuildingService extends TypeOrmCrudService<Building> {
    constructor(@InjectRepository(Building) buildRepository: Repository<Building>) {
        super(buildRepository);
    }
}
