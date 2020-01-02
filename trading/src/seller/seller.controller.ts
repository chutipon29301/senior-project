import { Controller } from '@nestjs/common';
import { Crud, CrudController } from '@nestjsx/crud';
import Seller from '../entity/Seller.entity';
import { SellerService } from './seller.service';

@Crud({
    model: {
        type: Seller,
    }
})
@Controller('seller')
export class SellerController implements CrudController<Seller>{
    constructor(readonly service: SellerService) { }
}
