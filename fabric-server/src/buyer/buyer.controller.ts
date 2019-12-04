import { Controller, Post, Param, Body } from '@nestjs/common';
import { Price, Quantity } from './buyer.dto';

@Controller('buyer')
export class BuyerController {

    @Post('price/:id')
    public async offerPrice(@Param('id') id: string, @Body() body: Price) {
        return body;
    }

    @Post('quantity/:id')
    public async usedQuantity(@Param('id') id: string, @Body() body: Quantity) {
        return body;
    }
}
