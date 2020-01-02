import { Controller } from '@nestjs/common';
import { CrudController, Crud } from '@nestjsx/crud';
import Round from '../entity/Round.entity';
import { RoundService } from './round.service';

@Crud({
    model: {
        type: Round,
    },
})
@Controller('round')
export class RoundController implements CrudController<Round>{
    constructor(readonly service: RoundService) { }

}
