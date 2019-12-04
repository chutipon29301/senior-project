import { Controller, Get } from '@nestjs/common';
import { SmartContractsService } from './smart-contracts.service';

@Controller('smart-contracts')
export class SmartContractsController {

    constructor(private readonly service: SmartContractsService) { }

    @Get('ping')
    public async ping(): Promise<string> {
        return this.service.ping();
    }
}
