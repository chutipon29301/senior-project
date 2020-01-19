import { Injectable, HttpService, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '../config/config.service';
import { FabricService } from '../fabric/fabric.service';
import { Organization } from '../entity/User.entity';

@Injectable()
export class OfferService {
    constructor(
        private readonly fabricService: FabricService,
    ) { }

    public async createOffer(roundId: string, price: number, organization: Organization, username: string) {
        switch (organization) {
            case Organization.Building:
                return this.fabricService.addBuyerBid(roundId, price, organization, username);
            case Organization.PV:
                return this.fabricService.addSellerBid(roundId, price, organization, username);
            case Organization.Utility:
                throw new UnauthorizedException();
        }
    }
}
