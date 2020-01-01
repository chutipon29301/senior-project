import { Controller, Post, Body, Param, Get, ParseIntPipe, Query } from '@nestjs/common';
import { InstallChaincodeDto, InstantiateChaincodeDto, InvokeChaincodeDto, GetChaincodeFromPeerDto, GetBlockByNumberDto, GetTransactionBuTransactionID } from './chaincode.dto';
import { ChaincodeService } from './chaincode.service';

@Controller('chaincode')
export class ChaincodeController {

    constructor(private readonly chaincodeService: ChaincodeService) { }

    @Post()
    public async installChaincode(@Body() body: InstallChaincodeDto) {
        return this.chaincodeService.installChaincode(body.peers, body.username, body.orgName);
    }

    @Post('instantiate/:channelName')
    public async instantiateChaincode(@Param('channelName') channelName: string, @Body() body: InstantiateChaincodeDto) {
        return this.chaincodeService.instantiateChaincode(body.peers, channelName, body.functionName, body.args, body.username, body.orgName);
    }

    @Post('invoke/:channelName/:chaincodeName')
    public async invokeTransaction(
        @Param('channelName') channelName: string,
        @Param('chaincodeName') chaincodeName: string,
        @Body() body: InvokeChaincodeDto) {
        return this.chaincodeService.invokeChaincode(
            body.peers, channelName, chaincodeName, body.fcn, body.args, body.username, body.orgName);
    }

    @Get('onPeer/:channelName/:chaincodeName')
    public async getChaincodeOnPeer(
        @Param('channelName') channelName: string,
        @Param('chaincodeName') chaincodeName: string,
        @Query() query: GetChaincodeFromPeerDto,
    ) {
        return this.chaincodeService.queryChaincode(
            query.peer, channelName, chaincodeName, JSON.parse(decodeURI(query.args)), query.fcn, query.username, query.orgName);
    }

    @Get('block/:channelName/:blockId')
    public async getBlockByNumber(
        @Param('channelName') channelName: string,
        @Param('blockId', new ParseIntPipe()) blockId: number,
        @Query() query: GetBlockByNumberDto,
    ) {
        return this.chaincodeService.getBlockByNumber(query.peer, channelName, blockId, query.username, query.orgName);
    }

    @Get('transaction/:channelName/:trxnId')
    public async getTransactionByTransactionId(
        @Param('channelName') channelName: string,
        @Param('trxnId') trxnId: string,
        @Query() query: GetTransactionBuTransactionID,
    ) {
        return this.chaincodeService.getTransactionByID(query.peer, channelName, trxnId, query.username, query.orgName);
    }

    @Get('block/:channelName/:hash')
    public async getBlockByHash(
        @Param('channelName') channelName: string,
        @Param('hash', new ParseIntPipe()) hash: string,
        @Query() query: GetBlockByNumberDto,
    ) {
        return this.chaincodeService.getBlockByHash(query.peer, channelName, hash, query.username, query.orgName);
    }

    @Get('info/:channelName')
    public async getChainInfo(
        @Param('channelName') channelName: string,
        @Query() query: GetBlockByNumberDto,
    ) {
        return this.chaincodeService.getChainInfo(query.peer, channelName, query.username, query.orgName);
    }

    @Get('instantiated/:channelName')
    public async getInstantiateChaincodes(
        @Param('channelName') channelName: string,
        @Query() query: GetBlockByNumberDto,
    ) {
        // .getInstalledChaincodes(peer, req.params.channelName, 'instantiated', req.username, req.orgname);
        const type = 'instantiated';
        return this.chaincodeService.getInstalledChaincodes(query.peer, channelName, type, query.username, query.orgName);
    }
    @Get('installed/:channelName')
    public async getInstalledChaincodes(
        @Param('channelName') channelName: string,
        @Query() query: GetBlockByNumberDto,
    ) {
        // .getInstalledChaincodes(peer, req.params.channelName, 'instantiated', req.username, req.orgname);
        const type = 'installed';
        return this.chaincodeService.getInstalledChaincodes(query.peer, channelName, type, query.username, query.orgName);
    }
}
