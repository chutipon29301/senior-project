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
                const buyerPreviousBid = round.buyerBids.find(o => o.userId === user.id);
                if (buyerPreviousBid) {
                    buyerPreviousBid.price = price;
                    await this.buyerBidRepository.save(buyerPreviousBid);
                } else {
                    const buyerBid = new BuyerBid();
                    buyerBid.price = price;
                    buyerBid.user = user;
                    buyerBid.round = round;
                    await this.buyerBidRepository.save(buyerBid);
                }
                await this.fabricService.addBuyerBid(round.id, price, user.organization, user.id);
            case Organization.PV:
                const sellerPreviousBid = round.sellerBids.find(o => o.userId === user.id);
                if (sellerPreviousBid) {
                    sellerPreviousBid.price = price;
                    await this.sellerBidRepository.save(sellerPreviousBid);
                } else {
                    const sellerBid = new SellerBid();
                    sellerBid.price = price;
                    sellerBid.user = user;
                    sellerBid.round = round;
                    await this.sellerBidRepository.save(sellerBid);
                }
                await this.fabricService.addSellerBid(round.id, price, user.organization, user.id);
            case Organization.Utility:
                throw new UnauthorizedException();
        }
    }

}
