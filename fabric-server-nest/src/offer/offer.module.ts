import { Module, HttpModule } from '@nestjs/common';
import { OfferService } from './offer.service';
import { OfferController } from './offer.controller';

@Module({
  imports: [HttpModule],
  providers: [OfferService],
  controllers: [OfferController]
})
export class OfferModule {}
