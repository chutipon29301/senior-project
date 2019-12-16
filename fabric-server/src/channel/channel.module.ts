import { Module } from '@nestjs/common';
import { ChannelService } from './channel.service';
import { ChannelController } from './channel.controller';
import { ClientModule } from '../client/client.module';

@Module({
  imports: [ClientModule],
  providers: [ChannelService],
  controllers: [ChannelController],
})
export class ChannelModule {}
