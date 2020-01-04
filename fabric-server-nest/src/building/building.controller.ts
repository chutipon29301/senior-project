import { Controller } from '@nestjs/common';
import { Crud, CrudController } from '@nestjsx/crud';
import Building from '../entity/Building.entity';
import { BuildingService } from './building.service';

@Crud({
    model: {
        type: Building,
    },
})
@Controller('building')
export class BuildingController implements CrudController<Building> {
    constructor(readonly service: BuildingService) { }
}
