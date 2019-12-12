import { Controller, Post } from '@nestjs/common';
import { ChannelService } from './channel.service';

@Controller('channel')
export class ChannelController {

    constructor(private readonly channelService: ChannelService) {}

    @Post()
    public async createChannel() {
        
    }
}
