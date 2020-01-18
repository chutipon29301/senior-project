import { Module } from '@nestjs/common';
import { RoundController } from './round.controller';
import { RoundService } from './round.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import Round from '../entity/Round.entity';
import { FabricModule } from '../fabric/fabric.module';

@Module({
  imports: [TypeOrmModule.forFeature([Round]), FabricModule],
  controllers: [RoundController],
  providers: [RoundService],
})
export class RoundModule { }
