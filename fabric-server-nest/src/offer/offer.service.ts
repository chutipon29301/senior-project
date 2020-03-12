import { Injectable, HttpService, UnauthorizedException } from '@nestjs/common';
import { FabricService } from '../fabric/fabric.service';
import User, { Organization } from '../entity/User.entity';
import { InjectRepository } from '@nestjs/typeorm';
import BuyerBid from '../entity/BuyerBid.entity';
import { Repository } from 'typeorm';
import SellerBid from '../entity/SellerBid.entity';
import { RoundService } from '../round/round.service';
import { ConfigService } from '../config/config.service';
import Round from '../entity/Round.entity';

@Injectable()
export class OfferService {
    constructor(
        @InjectRepository(BuyerBid) private readonly buyerBidRepository: Repository<BuyerBid>,
        @InjectRepository(SellerBid) private readonly sellerBidRepository: Repository<SellerBid>,
        @InjectRepository(Round) private readonly roundRepository: Repository<Round>,
        private readonly fabricService: FabricService,
        private readonly roundService: RoundService,
        private readonly configService: ConfigService,
    ) { }

    public async createOffer(date: Date, price: number, user: User) {
        const round = await this.roundService.findOneOrCreate(date, user);
        round.modifyDate = new Date();
        switch (user.organization) {
            case Organization.Building:
                if (round.buyerBids) {
                    const buyerPreviousBid = round.buyerBids.find(o => o.userId === user.id);
                    if (buyerPreviousBid) {
                        buyerPreviousBid.price = price;
                        await this.buyerBidRepository.save(buyerPreviousBid);
                    } else {
                        const buyerBid = new BuyerBid();
                        buyerBid.price = price;
                        buyerBid.user = user;
                        await this.buyerBidRepository.save(buyerBid);
                        if (round.buyerBids) {
                            round.buyerBids.push(buyerBid);
                        } else {
                            round.buyerBids = [buyerBid];
                        }
                    }
                } else {
                    const buyerBid = new BuyerBid();
                    buyerBid.price = price;
                    buyerBid.user = user;
                    await this.buyerBidRepository.save(buyerBid);
                    if (round.buyerBids) {
                        round.buyerBids.push(buyerBid);
                    } else {
                        round.buyerBids = [buyerBid];
                    }
                }
                if (this.configService.useFabric) {
                    await this.fabricService.addBuyerBid(round.id, price, user.organization, user.id);
                }
                await this.roundRepository.save(round);
                break;
            case Organization.PV:
                if (round.sellerBids) {
                    const sellerPreviousBid = round.sellerBids.find(o => o.userId === user.id);
                    if (sellerPreviousBid) {
                        sellerPreviousBid.price = price;
                        await this.sellerBidRepository.save(sellerPreviousBid);
                    } else {
                        const sellerBid = new SellerBid();
                        sellerBid.price = price;
                        sellerBid.user = user;
                        await this.sellerBidRepository.save(sellerBid);
                        if (round.sellerBids) {
                            round.sellerBids.push(sellerBid);
                        } else {
                            round.sellerBids = [sellerBid];
                        }
                    }
                } else {
                    const sellerBid = new SellerBid();
                    sellerBid.price = price;
                    sellerBid.user = user;
                    await this.sellerBidRepository.save(sellerBid);
                    if (round.sellerBids) {
                        round.sellerBids.push(sellerBid);
                    } else {
                        round.sellerBids = [sellerBid];
                    }
                }
                if (this.configService.useFabric) {
                    await this.fabricService.addSellerBid(round.id, price, user.organization, user.id);
                }
                await this.roundRepository.save(round);
                break;
            case Organization.Utility:
                throw new UnauthorizedException();
        }
    }

}
