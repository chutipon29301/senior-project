import { Module } from '@nestjs/common';
import { FabricService } from './fabric.service';
import { FabricController } from './fabric.controller';

@Module({
  providers: [FabricService],
  controllers: [FabricController]
})
export class FabricModule {}
