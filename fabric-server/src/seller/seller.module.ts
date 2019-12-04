import { Module } from '@nestjs/common';
import { SellerService } from './seller.service';
import { SellerController } from './seller.controller';

@Module({
  providers: [SellerService],
  controllers: [SellerController]
})
export class SellerModule {}
