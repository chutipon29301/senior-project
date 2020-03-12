import { Module, HttpModule } from '@nestjs/common';
import { RoundController } from './round.controller';
import { RoundService } from './round.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { FabricModule } from '../fabric/fabric.module';
import { ConfigModule } from '../config/config.module';
import Round from '../entity/Round.entity';
import User from '../entity/User.entity';
import { BuyTransaction } from '../entity/BuyTransaction.entity';
import { SellTransaction } from '../entity/SellTransaction.entity';
import Invoice from '../entity/Invoice.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Round, User, BuyTransaction, SellTransaction, Invoice]), FabricModule, ConfigModule, HttpModule],
  controllers: [RoundController],
  providers: [RoundService],
  exports: [RoundService],
})
export class RoundModule { }
