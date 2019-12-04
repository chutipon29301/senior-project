import { Controller, Post, Param, Body } from '@nestjs/common';
import { Price } from './buyer.dto';

@Controller('buyer')
export class BuyerController {

    @Post(':id')
    public async offerPrice(@Param('id') id: string, @Body() body: Price) {
        return body;
    }
}
