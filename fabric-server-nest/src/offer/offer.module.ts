import { Module } from '@nestjs/common';
import { OfferService } from './offer.service';
import { OfferController } from './offer.controller';
import { FabricModule } from '../fabric/fabric.module';

@Module({
  imports: [FabricModule],
  providers: [OfferService],
  controllers: [OfferController]
})
export class OfferModule {}
