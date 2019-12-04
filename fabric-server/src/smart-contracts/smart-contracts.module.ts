import { Module, HttpModule } from '@nestjs/common';
import { SmartContractsService } from './smart-contracts.service';
import { SmartContractsController } from './smart-contracts.controller';
import { ConfigModule } from '../config/config.module';

@Module({
  imports: [HttpModule, ConfigModule],
  providers: [SmartContractsService],
  controllers: [SmartContractsController],
})
export class SmartContractsModule {}
