import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { SmartContractsModule } from './smart-contracts/smart-contracts.module';

@Module({
  imports: [SmartContractsModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
