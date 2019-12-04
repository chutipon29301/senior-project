import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { SmartContractsModule } from './smart-contracts/smart-contracts.module';
import { BuyerModule } from './buyer/buyer.module';
import { SellerModule } from './seller/seller.module';
import { ConfigModule } from './config/config.module';

@Module({
  imports: [SmartContractsModule, BuyerModule, SellerModule, ConfigModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
