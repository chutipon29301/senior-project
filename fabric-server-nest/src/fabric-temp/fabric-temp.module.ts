import { Module } from '@nestjs/common';
import { FabricTempService } from './fabric-temp.service';
import { FabricTempController } from './fabric-temp.controller';

@Module({
  providers: [FabricTempService],
  controllers: [FabricTempController],
})
export class FabricTempModule { }
