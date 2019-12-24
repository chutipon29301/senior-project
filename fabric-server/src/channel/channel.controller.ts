import { Controller, Post, Body, Get } from '@nestjs/common';
import { ChannelService } from './channel.service';
import { CreateChannelDto } from './channel.dto';

@Controller('channel')
export class ChannelController {
    constructor(private readonly channelService: ChannelService) {}
    @Get()
    public async getChannels() {
        return this.channelService.getChannels();
    }
    @Post()
    public async createChannel(@Body() body: CreateChannelDto) {
        return this.channelService.createChannel(body.channelName, body.orgName);
    }

}
