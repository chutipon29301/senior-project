import { Module } from '@nestjs/common';
import { OfferService } from './offer.service';
import { OfferController } from './offer.controller';
import { FabricModule } from '../fabric/fabric.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import SellerBid from '../entity/SellerBid.entity';
import BuyerBid from '../entity/BuyerBid.entity';
import Round from '../entity/Round.entity';
import { RoundModule } from '../round/round.module';

@Module({
  imports: [FabricModule, RoundModule, TypeOrmModule.forFeature([SellerBid, BuyerBid])],
  providers: [OfferService],
  controllers: [OfferController],
})
export class OfferModule { }
