import { Repository } from 'typeorm';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import Round from '../entity/Round.entity';
import { FabricService } from '../fabric/fabric.service';
import User from '../entity/User.entity';

@Injectable()
export class RoundService {

    constructor(
        @InjectRepository(Round) private readonly roundRepository: Repository<Round>,
        private readonly fabricService: FabricService,
    ) { }

    public async createRound(startDate: Date, endDate: Date, user: User): Promise<Round> {
        const round = new Round();
        round.startDate = startDate;
        round.endDate = endDate;
        await this.roundRepository.save(round);
        await this.fabricService.createRound(round.id, user.organization, user.id);
        return round;
    }

}
