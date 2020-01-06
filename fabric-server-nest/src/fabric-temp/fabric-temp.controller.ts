import { Controller, Get, Param, Post, Body, Query } from '@nestjs/common';
import { FabricTempService } from './fabric-temp.service';
import { RegisterAndEnrollUserDto, CreateChannelDto, JoinChannelDto, UpdateAnchorPeersDto, InstallChaincodeDto, InstantiateChaincodeDto, InvokeChaincodeDto, QueryChaincodeParamDto, QueryChaincodeQueryDto } from './fabric-temp.dto';

@Controller('fabric-temp')
export class FabricTempController {
    constructor(private readonly fabricService: FabricTempService) { }

    @Post('user')
    public async findOrCreateUser(@Body() { username, orgName }: RegisterAndEnrollUserDto) {
        return this.fabricService.findUserOrCreate(username, orgName);
    }

    @Post('channel')
    public async createChannel(@Body() { channelName, username, orgName }: CreateChannelDto) {
        return this.fabricService.createChannel(channelName, username, orgName)
    }

    @Post('joinChannel')
    public async joinChannel(@Body() { channelName, peers, username, orgName }: JoinChannelDto) {
        return this.fabricService.joinChannel(channelName, peers, username, orgName);
    }

    @Post('updatePeers')
    public async updateAnchorPeers(@Body() { channelName, configUpdatePath, username, orgName }: UpdateAnchorPeersDto) {
        return this.fabricService.updateAnchorPeers(channelName, configUpdatePath, username, orgName);
    }

    @Post('installChaincode')
    public async installChaincode(@Body() { peers, username, orgName }: InstallChaincodeDto) {
        return this.fabricService.installChaincode(peers, username, orgName);
    }

    @Post('instantiateChaincode')
    public async instantiateChaincode(@Body() { peers, channelName, functionName, args, username, orgName }: InstantiateChaincodeDto) {
        return this.fabricService.instantiateChaincode(peers, channelName, functionName, args, username, orgName);
    }

    @Post('invokeChaincode')
    public async invokeChaincode(@Body() { peers, channelName, chaincodeName, functionName, args, username, orgName }: InvokeChaincodeDto) {
        return this.fabricService.invokeChaincode(peers, channelName, chaincodeName, functionName, args, username, orgName);
    }

    @Get('chaincode/:channelName/:chaincodeName/:functionName')
    public async queryChaincode(
        @Param() { channelName, chaincodeName, functionName }: QueryChaincodeParamDto,
        @Query() { peer, args, username, orgName }: QueryChaincodeQueryDto,
    ) {
        return this.fabricService.queryChaincode(peer, channelName, chaincodeName, JSON.parse(decodeURI(args)), functionName, username, orgName);
    }
}
