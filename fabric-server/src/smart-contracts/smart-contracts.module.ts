import { Module } from '@nestjs/common';
import { SmartContractsService } from './smart-contracts.service';
import { SmartContractsController } from './smart-contracts.controller';

@Module({
  providers: [SmartContractsService],
  controllers: [SmartContractsController]
})
export class SmartContractsModule {}
