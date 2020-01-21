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

    public async createRound(startDate: Date, endDate: Date, {organization, id}: User): Promise<Round> {
        const round = new Round();
        round.startDate = startDate;
        round.endDate = endDate;
        await this.roundRepository.save(round);
        await this.fabricService.createRound(round.id, organization, id);
        return round;
    }

    public async listRounds(): Promise<Round[]> {
        return this.roundRepository.find();
    }

    public async getChaincodeInRound(roundId: string, { organization, id }: User) {
        return this.fabricService.getChaincode(roundId, organization, id);
    }

    // public async getRound(roundId: string) {
    //     this.fabricService.
    // }

}
