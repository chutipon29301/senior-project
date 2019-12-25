import { Module } from '@nestjs/common';
import { ChaincodeService } from './chaincode.service';
import { ChaincodeController } from './chaincode.controller';

@Module({
  providers: [ChaincodeService],
  controllers: [ChaincodeController]
})
export class ChaincodeModule {}
