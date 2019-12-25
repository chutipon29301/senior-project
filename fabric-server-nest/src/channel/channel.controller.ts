import { Controller, Post, Body } from '@nestjs/common';
import { ChannelService } from './channel.service';
import { CreateChannelDto, JoinChannelDto } from './channel.dto';

@Controller('channel')
export class ChannelController {

    constructor(private readonly channelService: ChannelService) { }

    @Post()
    public async createChannel(@Body() body: CreateChannelDto) {
        return this.channelService.createChannel(body.channelName, body.username, body.orgName);
    }

    @Post('join')
    public async joinChannel(@Body() body: JoinChannelDto) {
        return this.channelService.joinChannel(body.channelName, body.peers, body.username, body.orgName);
    }
}
