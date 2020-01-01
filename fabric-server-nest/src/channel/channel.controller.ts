import { Controller, Post, Body, Param, Get, Query } from '@nestjs/common';
import { ChannelService } from './channel.service';
import { CreateChannelDto, JoinChannelDto, UpdateAnchorPeersDto } from './channel.dto';

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

    @Post(':channelName/anchorPeers')
    public async updateAnchorPeers(@Param('channelName') channelName: string, @Body() body: UpdateAnchorPeersDto) {
        return this.channelService.updateAnchorPeers(channelName, body.configUpdatePath, body.username, body.orgName);
    }

    @Get()
    public async listPeerChannel(@Query('peer') peer: string, @Query('username') username: string, @Query('orgName') orgName: string) {
        return this.channelService.getChannels(peer, username, orgName)
    }

}
