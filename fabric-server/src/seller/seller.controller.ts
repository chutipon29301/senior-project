import { Controller, Post, Param, Body } from '@nestjs/common';
import { Price, Quantity } from './seller.dto';

@Controller('seller')
export class SellerController {

    @Post('price/:id')
    public async offerPrice(@Param('id') id: string, @Body() body: Price) {
        return body;
    }

    @Post('quantity/:id')
    public async generatedQuantity(@Param('id') id: string, @Body() body: Quantity) {
        return body;
    }
}
