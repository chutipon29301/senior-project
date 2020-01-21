import { Controller, Post, Body, Get, Param } from '@nestjs/common';
import Round from '../entity/Round.entity';
import { RoundService } from './round.service';
import { Orgs } from '../decorator/org.decorator';
import User, { Organization } from '../entity/User.entity';
import { CreateRoundDto } from './round.dto';
import { RequestUser } from '../decorator/user.decorator';

@Controller('round')
export class RoundController {
    constructor(private readonly service: RoundService) { }

    @Orgs(Organization.Building, Organization.PV)
    @Post()
    public async createRound(@RequestUser() user: User, @Body() { startDate, endDate }: CreateRoundDto): Promise<Round> {
        return this.service.createRound(new Date(startDate), new Date(endDate), user);
    }

    @Orgs()
    @Get()
    public async listRound(): Promise<Round[]> {
        return this.service.listRounds();
    }

    @Orgs()
    @Get(':id')
    public async getRound(@RequestUser() user: User, @Param('id') id: string) {
        return this.service.getChaincodeInRound(id, user);
    }
}
