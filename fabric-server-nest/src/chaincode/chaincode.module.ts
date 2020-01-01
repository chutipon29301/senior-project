import { Module } from '@nestjs/common';
import { ChaincodeService } from './chaincode.service';
import { ChaincodeController } from './chaincode.controller';
import { ClientModule } from '../client/client.module';

@Module({
  imports: [ClientModule],
  providers: [ChaincodeService],
  controllers: [ChaincodeController],
})
export class ChaincodeModule { }
