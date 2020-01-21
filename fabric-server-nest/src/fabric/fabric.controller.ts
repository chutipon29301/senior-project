import { Controller, Post, Param, Get, Body, Query } from '@nestjs/common';
import { FabricService } from './fabric.service';
import { InvokeChaincodeDto, QueryChaincodeParamDto, QueryChaincodeQueryDto } from './fabric.dto';
import User from '../entity/User.entity';
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
    @Get('channel')
    public async getChannel(@RequestUser() { organization }: User): Promise<boolean> {
        const channel = await this.fabricService.getChannel(organization);
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
    @Get('chaincode/:functionName')
    public async queryChaincode(
        @Param() { functionName }: QueryChaincodeParamDto,
        @Query() { args }: QueryChaincodeQueryDto,
        @RequestUser() { id, organization }: User,
    ) {
        return this.fabricService.queryChaincode(
            JSON.parse(decodeURI(args)),
            functionName,
            organization,
            id);
    }

    @Orgs()
    @Post('channel')
    public async createChannel(@RequestUser() { organization }: User) {
        await this.fabricService.createChannel(organization);
    }

    @Orgs()
    @Post('channel/join')
    public async joinChannel(@RequestUser() { organization }: User) {
        await this.fabricService.joinChannel(organization);
    }

    @Orgs()
    @Post('chaincode/install')
    public async installChaincode(@RequestUser() { organization }: User) {
        await this.fabricService.installChaincode(organization);
    }

    @Orgs()
    @Post('chaincode/instantiate')
    public async instantiateChaincode(@RequestUser() { organization }: User) {
        return this.fabricService.instantiateChaincode(organization);
    }

    @Orgs()
    @Post('chaincode/invoke')
    public async invokeChaincode(@RequestUser() { organization, id }: User, @Body() { fcn, args }: InvokeChaincodeDto) {
        return this.fabricService.invokeChaincode(fcn, args, organization, id);
    }

}
