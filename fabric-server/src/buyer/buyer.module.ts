import { Module } from '@nestjs/common';
import { BuyerService } from './buyer.service';
import { BuyerController } from './buyer.controller';

@Module({
  providers: [BuyerService],
  controllers: [BuyerController]
})
export class BuyerModule {}
