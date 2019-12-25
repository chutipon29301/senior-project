import { Controller, Post, Body } from '@nestjs/common';
import { ChannelService } from './channel.service';
import { CreateChannelDto } from './channel.dto';

@Controller('channel')
export class ChannelController {

    constructor(private readonly channelService: ChannelService) { }

    @Post()
    public async createChannel(@Body() body: CreateChannelDto) {
        return this.channelService.createChannel(body.channelName, body.username, body.orgName);
    }
}
