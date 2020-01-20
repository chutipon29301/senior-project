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
    @Post()
    public async createOffer(@RequestUser() { organization, id }: User, @Body() { price, roundId }: CreateOfferDto) {
        return this.service.createOffer(roundId, price, organization, id);
    }

}
