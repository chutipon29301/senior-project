import { Repository, MoreThan, LessThanOrEqual } from 'typeorm';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import Round from '../entity/Round.entity';
import { FabricService } from '../fabric/fabric.service';
import User from '../entity/User.entity';
import { ConfigService } from '../config/config.service';

@Injectable()
export class RoundService {

    constructor(
        @InjectRepository(Round) private readonly roundRepository: Repository<Round>,
        private readonly fabricService: FabricService,
        private readonly configService: ConfigService,
    ) { }

    public async createRound(startDate: Date, endDate: Date, { organization, id }: User): Promise<Round> {
        const round = new Round();
        round.startDate = startDate;
        round.endDate = endDate;
        await this.roundRepository.save(round);
        if (this.configService.useFabric) {
            await this.fabricService.createRound(round.id, organization, id);
        }
        return round;
    }

    public async findOneOrCreate(date: Date, user: User): Promise<Round> {
        const round = await this.roundRepository.findOne({
            where: {
                startDate: LessThanOrEqual(date),
                endDate: MoreThan(date),
            },
        });
        if (round) {
            return round;
        } else {
            return this.createRound(
                new Date(date.getFullYear(), date.getMonth(), date.getDate(), date.getHours()),
                new Date(date.getFullYear(), date.getMonth(), date.getDate(), date.getHours() + 1),
                user,
            );
        }
    }

    public async listRounds(): Promise<Round[]> {
        return this.roundRepository.find();
    }

    public async getChaincodeInRound(roundId: string, { organization, id }: User) {
        return this.fabricService.getChaincode(roundId, organization, id);
    }

}
