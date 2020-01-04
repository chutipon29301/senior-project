import { Controller } from '@nestjs/common';
import { TradeService } from './trade.service';

@Controller('trade')
export class TradeController {
    constructor(readonly service: TradeService) { }
}
