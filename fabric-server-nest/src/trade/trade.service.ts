import { Injectable, HttpService } from '@nestjs/common';
import { ConfigService } from '../config/config.service';
import Round from '../entity/Round.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, LessThanOrEqual, MoreThan, Timestamp } from 'typeorm';

@Injectable()
export class TradeService {
    constructor(
        @InjectRepository(Round) private readonly roundRepository: Repository<Round>,
        private readonly httpService: HttpService,
        private readonly configService: ConfigService,
    ) { }
    // public async getQuantity() {

    // }
    // public async sendBidDisKda(timestamp: Date) {
    //     const round = this.roundRepository.findOne({
    //         where: {
    //             startDate: LessThanOrEqual(timestamp),
    //             endDate: MoreThan(timestamp),
    //         },
    //     });
    //     //fabric
    //     const buyers = [];
    //     const sellers = [];
    //     const { data } = await this.httpService.post(`${this.configService.smartContractUrl}/`, {
    //         "buyers": buyers,
    //         "sellers": sellers
    //     }).toPromise();

    // }
    // public async sendBidUniKda() {

    // }
    // public async sendBidAvg() {

    // }

    public async timeTrigger(timestamp: Date) {
        console.log(`${this.configService.smartContractUrl}/uniKDA`);
        const { data } = await this.httpService.post(`http://${this.configService.smartContractUrl}/uniKDA`, {
            buyers: [{
                quantity: 150.2,
                bidPrice: 3.9,
                timestamp: '2020-01-03T14:51:16.147487',
            }, {
                quantity: 49.7,
                bidPrice: 3.2,
                timestamp: '2020-01-03T14:51:16.147545',
            }, {
                quantity: 424.2,
                bidPrice: 4.7,
                timestamp: '2020-01-03T14:51:16.147589',
            },
            {
                quantity: 96.1,
                bidPrice: 3.8,
                timestamp: '2020-01-03T14:51:16.147625',
            },
            {
                quantity: 698.61,
                bidPrice: 3.3,
                timestamp: '2020-01-03T14:51:16.147728',
            }],
            sellers: [{
                quantity: 71.2,
                bidPrice: 5.0,
                timestamp: '2020-01-03T14:51:16.148477',
            },
            {
                quantity: 61.9,
                bidPrice: 4.9,
                timestamp: '2020-01-03T14:51:16.148540',
            },
            {
                quantity: 57.6,
                bidPrice: 3.5,
                timestamp: '2020-01-03T14:51:16.148575',
            },
            {
                quantity: 22.1,
                bidPrice: 3.1,
                timestamp: '2020-01-03T14:51:16.148608',
            },
            {
                quantity: 0.0,
                bidPrice: 3.7,
                timestamp: '2020-01-03T14:51:16.148641',
            }],
        }).toPromise();
        console.log(data);
        const round = await this.roundRepository.findOne({
            where: {
                startDate: LessThanOrEqual(timestamp),
                endDate: MoreThan(timestamp),
            },
        });
    }
}
