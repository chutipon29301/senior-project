import { Controller, Post, Body } from '@nestjs/common';
import { InstallChaincodeDto } from './chaincode.dto';
import { ChaincodeService } from './chaincode.service';

@Controller('chaincode')
export class ChaincodeController {

    constructor(private readonly chaincodeService: ChaincodeService) { }

    @Post()
    public async installChaincode(@Body() body: InstallChaincodeDto) {
        return this.chaincodeService.installChaincode(body.peers, body.username, body.orgName);
    }
}
