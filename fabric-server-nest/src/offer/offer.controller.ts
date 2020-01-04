import { Controller, Post, Body } from '@nestjs/common';
import { OfferDto } from './offer.dto';
import { OfferService } from './offer.service';

@Controller('offer')
export class OfferController {

    constructor(private readonly service: OfferService) { }

    @Post('pv')
    public async createSellerOffer(@Body() { id, price }: OfferDto) {
        this.service.sendPvOffer(id, price);
    }
    @Post('building')
    public async createBuyerOffer(@Body() { id, price }: OfferDto) {
        this.service.sendBuildingOffer(id, price);
    }
}
