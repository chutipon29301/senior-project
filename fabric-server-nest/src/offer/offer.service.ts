import { Injectable, HttpService, UnauthorizedException } from '@nestjs/common';
import { FabricService } from '../fabric/fabric.service';
import User, { Organization } from '../entity/User.entity';
import { InjectRepository } from '@nestjs/typeorm';
import BuyerBid from '../entity/BuyerBid.entity';
import { Repository } from 'typeorm';
import SellerBid from '../entity/SellerBid.entity';
import { RoundService } from '../round/round.service';

@Injectable()
export class OfferService {
    constructor(
        private readonly fabricService: FabricService,
        private readonly roundService: RoundService,
        @InjectRepository(BuyerBid) private buyerBidRepository: Repository<BuyerBid>,
        @InjectRepository(SellerBid) private sellerBidRepository: Repository<SellerBid>,
    ) { }

    public async createOffer(date: Date, price: number, user: User) {
        const round = await this.roundService.findOneOrCreate(date, user);
        switch (user.organization) {
            case Organization.Building:
                const buyerBid = new BuyerBid();
                buyerBid.price = price;
                buyerBid.user = user;
                buyerBid.round = round;
                await this.buyerBidRepository.save(buyerBid);
                return this.fabricService.addBuyerBid(round.id, price, user.organization, user.id);
            case Organization.PV:
                const sellerBid = new SellerBid();
                sellerBid.price = price;
                sellerBid.user = user;
                sellerBid.round = round;
                await this.sellerBidRepository.save(sellerBid);
                return this.fabricService.addSellerBid(round.id, price, user.organization, user.id);
            case Organization.Utility:
                throw new UnauthorizedException();
        }
    }

}
