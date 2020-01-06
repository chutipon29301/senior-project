import { Controller, Get, Body } from '@nestjs/common';
import { TradeService } from './trade.service';
import { TradeDto } from './trade.dto';

@Controller('trade')
export class TradeController {
    constructor(readonly service: TradeService) { }

    @Get('timeTrigger')
    public async timeTrigger() {
        this.service.timeTrigger(null);
        // this.service.timeTrigger()
    }
}
