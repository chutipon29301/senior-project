import { Controller, Post, Param, Get, Body, Query } from '@nestjs/common';
import { FabricService } from './fabric.service';
import {
    JoinChannelDto,
    CreateChannelDto,
    InstallChaincodeDto,
    InvokeChaincodeDto,
    QueryChaincodeParamDto,
    QueryChaincodeQueryDto,
    InstantiateChaincodeDto,
} from './fabric.dto';
import User, { Organization } from '../entity/User.entity';
import { Orgs } from '../decorator/org.decorator';
import { RequestUser } from '../decorator/user.decorator';

@Controller('fabric')
export class FabricController {

    constructor(private readonly fabricService: FabricService) { }

    @Orgs()
    @Get('user')
    public async findUser(@RequestUser() { id, organization }: User): Promise<boolean> {
        return this.fabricService.checkExistUser(id, organization);
    }

    @Orgs()
    @Get('peers')
    public async getPeersInOrganization(@RequestUser() { organization }: User) {
        return this.fabricService.getPeersNameInOrg(organization);
    }

    @Orgs()
    @Get('channel/:channelName')
    public async getChannel(@RequestUser() { organization }: User, @Param('channelName') channelName: string): Promise<boolean> {
        const channel = await this.fabricService.getChannel(channelName, organization);
        if (channel) {
            return true;
        } else {
            return false;
        }
    }

    @Orgs()
    @Get('listChannel/:peer')
    public async listChannelNameInPeer(@RequestUser() { id, organization }: User, @Param('peer') peer: string): Promise<string[]> {
        return this.fabricService.listChannelNameInPeer(peer, organization, id);
    }

    @Orgs()
    @Get('chaincode/:channelName/:chaincodeName/:functionName')
    public async queryChaincode(
        @Param() { channelName, chaincodeName, functionName }: QueryChaincodeParamDto,
        @Query() { peer, args }: QueryChaincodeQueryDto,
        @RequestUser() { id, organization }: User,
    ) {
        return this.fabricService.queryChaincode(
            peer,
            channelName,
            chaincodeName,
            JSON.parse(decodeURI(args)),
            functionName,
            organization,
            id);
    }

    @Orgs()
    @Post('channel')
    public async createChannel(@RequestUser() { organization }: User, @Body() { channelName }: CreateChannelDto) {
        await this.fabricService.createChannel(channelName, organization);
    }

    @Orgs()
    @Post('channel/join')
    public async joinChannel(@RequestUser() { organization }: User, @Body() { channelName }: JoinChannelDto) {
        await this.fabricService.joinChannel(channelName, organization);
    }

    @Orgs()
    @Post('chaincode/install')
    public async installChaincode(@RequestUser() { organization }: User) {
        await this.fabricService.installChaincode(organization);
    }

    @Orgs()
    @Post('chaincode/instantiate')
    public async instantiateChaincode(@RequestUser() { organization }: User, @Body() { channelName }: InstantiateChaincodeDto) {
        return this.fabricService.instantiateChaincode(channelName, organization);
    }

    @Orgs()
    @Post('chaincode/invoke')
    public async invokeChaincode(@RequestUser() { organization }: User, @Body() { peers, channelName, fcn, args }: InvokeChaincodeDto) {
        return this.fabricService.invokeChaincode(peers, channelName, fcn, args, organization);
    }

}
