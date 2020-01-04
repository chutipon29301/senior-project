import { Injectable, HttpService } from '@nestjs/common';
import { ConfigService } from '../config/config.service';
import Round from '../entity/Round.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, LessThanOrEqual, MoreThan } from 'typeorm';

@Injectable()
export class TradeService {
    constructor(
        @InjectRepository(Round) private readonly roundRepository: Repository<Round>,
        private readonly httpService: HttpService,
        private readonly configService: ConfigService,
    ) { }
    public async getQuantity() {

    }
    public async sendBidDisKda(timestamp: Date) {
        const round = this.roundRepository.findOne({
            where: {
                startDate: LessThanOrEqual(timestamp),
                endDate: MoreThan(timestamp),
            },
        });
        //fabric
        const buyers = [];
        const sellers = [];
        const { data } = await this.httpService.post(`${this.configService.smartContractUrl}/`, {
            "buyers": buyers,
            "sellers": sellers
        }).toPromise();

    }
    public async sendBidUniKda() {

    }
    public async sendBidAvg() {

    }


}
