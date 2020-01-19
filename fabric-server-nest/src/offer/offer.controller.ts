import { Controller, Post, Body } from '@nestjs/common';
import { CreateOfferDto } from './offer.dto';
import { OfferService } from './offer.service';
import { Orgs } from '../decorator/org.decorator';
import User, { Organization } from '../entity/User.entity';
import { RequestUser } from '../decorator/user.decorator';

@Controller('offer')
export class OfferController {

    constructor(private readonly service: OfferService) { }

    @Orgs(Organization.Building, Organization.PV)
    @Post('')
    public async createOffer(@RequestUser() user: User, @Body() { price, roundId }: CreateOfferDto) {
        
    }

    // @Post('pv')
    // public async createSellerOffer(@Body() { id, price }: OfferDto) {
    //     this.service.sendPvOffer(id, price);
    // }
    // @Post('building')
    // public async createBuyerOffer(@Body() { id, price }: OfferDto) {
    //     this.service.sendBuildingOffer(id, price);
    // }
}
