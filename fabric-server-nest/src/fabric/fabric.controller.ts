import { Controller, Post, Param, Get, Body, Query } from '@nestjs/common';
import { FabricService } from './fabric.service';
import { CreateUserDto, JoinChannelDto, CreateChannelDto, GetChannelNameDto, InstallChaincodeDto, InvokeChaincodeDto, QueryChaincodeParamDto, QueryChaincodeQueryDto, InstantiateChaincodeDto } from './fabric.dto';

@Controller('fabric')
export class FabricController {

    constructor(private readonly fabricService: FabricService) { }

    @Get('user/:username')
    public async findUser(@Param('username') username: string): Promise<boolean> {
        return this.fabricService.checkExistUser(username, 'Org1');
    }

    @Post('user')
    public async crateUser(@Body() { username }: CreateUserDto) {
        return this.fabricService.createUser(username, 'Org1');
    }

    @Get('channel/:channelName')
    public async getChannel(@Param('channelName') channelName: string): Promise<boolean> {
        const channel = await this.fabricService.getChannel(channelName, 'Org1');
        if (channel) {
            return true;
        } else {
            return false;
        }
    }

    @Get('channel/:organizationName/:peer')
    public async getChannelNameInPeer(@Param() { peer, organizationName }: GetChannelNameDto): Promise<string[]> {
        return await this.fabricService.listChannelNameInPeer(peer, organizationName);
    }

    @Get('chaincode/:channelName/:chaincodeName/:functionName')
    public async queryChaincode(
        @Param() { channelName, chaincodeName, functionName }: QueryChaincodeParamDto,
        @Query() { peer, args, organizationName }: QueryChaincodeQueryDto,
    ) {
        return this.fabricService.queryChaincode(peer, channelName, chaincodeName, JSON.parse(decodeURI(args)), functionName, organizationName);
    }

    @Post('channel')
    public async createChannel(@Body() { channelName, organizationName }: CreateChannelDto) {
        await this.fabricService.createChannel(channelName, organizationName);
    }

    @Post('channel/join')
    public async joinChannel(@Body() { channelName, peers, organizationName }: JoinChannelDto) {
        await this.fabricService.joinChannel(channelName, peers, organizationName);
    }

    @Post('chaincode/install')
    public async installChaincode(@Body() { organizationName, peers }: InstallChaincodeDto) {
        await this.fabricService.installChaincode(organizationName, peers);
    }

    @Post('chaincode/instantiate')
    public async instantiateChaincode(@Body() { channelName, organizationName }: InstantiateChaincodeDto) {
        return this.fabricService.instantiateChaincode(channelName, organizationName);
    }

    @Post('chaincode/invoke')
    public async invokeChaincode(@Body() { peers, channelName, fcn, args, organizationName }: InvokeChaincodeDto) {
        return this.fabricService.invokeChaincode(peers, channelName, fcn, args, organizationName);
    }

    @Post('setup')
    public async setUpNetwork() {
        await this.fabricService.createChannel('mychannel', 'Org1');
        await this.fabricService.joinChannel('mychannel', ['peer0.org1.example.com'], 'Org1');
        await this.fabricService.joinChannel('mychannel', ['peer0.org2.example.com'], 'Org2');
        await this.fabricService.installChaincode('Org1', ['peer0.org1.example.com']);
        await this.fabricService.installChaincode('Org2', ['peer0.org2.example.com']);
    }

}
