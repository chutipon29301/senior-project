import { Injectable } from '@nestjs/common';
import Seller from '../entity/Seller.entity';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { TypeOrmCrudService } from '@nestjsx/crud-typeorm';

@Injectable()
export class SellerService extends TypeOrmCrudService<Seller>{
    constructor(@InjectRepository(Seller) private readonly sellerRepository: Repository<Seller>) {
        super(sellerRepository);
    }
}
