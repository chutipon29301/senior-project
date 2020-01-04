import { Module, HttpModule } from '@nestjs/common';
import { TradeService } from './trade.service';
import { TradeController } from './trade.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import Round from '../entity/Round.entity';
import { ConfigModule } from '../config/config.module';

@Module({
  imports: [TypeOrmModule.forFeature([Round]), HttpModule, ConfigModule],
  providers: [TradeService],
  controllers: [TradeController],
})
export class TradeModule {}
