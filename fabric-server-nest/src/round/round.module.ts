import { Module } from '@nestjs/common';
import { RoundController } from './round.controller';
import { RoundService } from './round.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import Round from '../entity/Round.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Round])],
  controllers: [RoundController],
  providers: [RoundService],
})
export class RoundModule { }
