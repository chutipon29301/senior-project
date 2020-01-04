import { Controller, Post, Body, Param, Get, Query } from '@nestjs/common';
import { ChannelService } from './channel.service';
import { CreateChannelDto, JoinChannelDto, UpdateAnchorPeersDto } from './channel.dto';

@Controller('channel')
export class ChannelController {

    constructor(private readonly channelService: ChannelService) { }

    @Post()
    public async createChannel(@Body() { channelName, username, organizationName }: CreateChannelDto) {
        return this.channelService.createChannel(channelName, username, organizationName);
    }

    @Post('join')
    public async joinChannel(@Body() { channelName, peers, username, organizationName }: JoinChannelDto) {
        return this.channelService.joinChannel(channelName, peers, username, organizationName);
    }

    @Post(':channelName/anchorPeers')
    public async updateAnchorPeers(
        @Param('channelName') channelName: string,
        @Body() { configUpdatePath, username, organizationName }: UpdateAnchorPeersDto,
    ) {
        return this.channelService.updateAnchorPeers(channelName, configUpdatePath, username, organizationName);
    }

}
