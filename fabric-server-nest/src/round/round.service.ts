import { Repository, MoreThan, LessThanOrEqual } from 'typeorm';
import { Injectable, BadRequestException, HttpService, ServiceUnavailableException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import Round, { MarketClearingStrategy } from '../entity/Round.entity';
import { FabricService } from '../fabric/fabric.service';
import User, { Organization } from '../entity/User.entity';
import { ConfigService } from '../config/config.service';
import { SmartMeterResponse, MarketClearRequestDto, MarketClearResponseDto } from './round.dto';
import { ChaincodeRoundDto } from '../fabric/fabric.dto';
import { BuyTransaction } from '../entity/BuyTransaction.entity';
import { SellTransaction } from '../entity/SellTransaction.entity';
import Invoice from '../entity/Invoice.entity';

@Injectable()
export class RoundService {

    constructor(
        @InjectRepository(Round) private readonly roundRepository: Repository<Round>,
        @InjectRepository(User) private readonly userRepository: Repository<User>,
        @InjectRepository(BuyTransaction) private readonly buyTransactionRepository: Repository<BuyTransaction>,
        @InjectRepository(SellTransaction) private readonly sellTransactionRepository: Repository<SellTransaction>,
        @InjectRepository(Invoice) private readonly invoiceRepository: Repository<Invoice>,
        private readonly fabricService: FabricService,
        private readonly configService: ConfigService,
        private readonly httpService: HttpService,
    ) { }

    public async createRound(startDate: Date, endDate: Date, { organization, id }: User): Promise<Round> {
        const round = new Round();
        round.startDate = startDate;
        round.endDate = endDate;
        round.modifyDate = new Date();
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
            relations: ['buyerBids', 'sellerBids'],
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

    public async getChaincodeInRound(roundId: string, { organization, id }: User): Promise<ChaincodeRoundDto> {
        if (this.configService.useFabric) {
            return this.fabricService.getRound(roundId, organization, id);
        } else {
            const round = await this.roundRepository.findOne(roundId, {
                relations: [
                    'buyerBids',
                    'sellerBids',
                    'sellTransactions',
                    'sellTransactions.invoices',
                    'sellTransactions.invoices.buyTransaction',
                ],
            });
            const result: ChaincodeRoundDto = {
                modifyDate: round.modifyDate,
                sellerBids: round.sellerBids.map(o => ({
                    id: o.userId,
                    price: o.price,
                    timestamp: o.timestamp,
                })),
                buyerBids: round.buyerBids.map(o => ({
                    id: o.userId,
                    price: o.price,
                    timestamp: o.timestamp,
                })),
                invoices: [].concat.apply([], round.sellTransactions.map(sellTransaction =>
                    sellTransaction.invoices.map(o => ({
                        buyerId: o.buyTransaction.userId,
                        sellerId: sellTransaction.userId,
                        quantity: o.quantity,
                        price: o.price,
                    })))),
            };
            return result;
        }
    }

    public async clearMarket(roundId: string, { organization, id: userId }: User) {
        const round = await this.roundRepository.findOne(roundId, {
            relations: ['buyerBids', 'sellerBids', 'buyerBids.user', 'sellerBids.user'],
        });
        if (!round) {
            throw new BadRequestException(`Round with id ${roundId} not found`);
        }
        try {
            const { data: smartMeterResponse } = await this.httpService.get<SmartMeterResponse[]>(
                `http://${this.configService.smartMeterUrl}/smartmeter`,
                {
                    params: {
                        timestamp: round.endDate.toISOString(),
                    },
                }).toPromise();
            const utilities = await this.userRepository.find({
                where: { organization: Organization.Utility },
            });
            const marketClearRequest: MarketClearRequestDto = {
                buyers: round.buyerBids.map(o => ({
                    id: o.userId,
                    quantity: smartMeterResponse.find(a => a.id === o.user.smartMeterId).quantity,
                    bidPrice: o.price,
                    timestamp: o.timestamp,
                })),
                sellers: round.sellerBids.map(o => ({
                    id: o.userId,
                    quantity: smartMeterResponse.find(a => a.id === o.user.smartMeterId).quantity,
                    bidPrice: o.price,
                    timestamp: o.timestamp,
                })),
                utilities: utilities.map(o => o.id),
            };
            let smartContractUrl: string = `http://${this.configService.smartContractUrl}/`;
            switch (round.strategy) {
                case MarketClearingStrategy.DISKDA:
                    smartContractUrl += 'disKDA';
                    break;
                case MarketClearingStrategy.UNIKDA:
                    smartContractUrl += 'uniKDA';
                    break;
                case MarketClearingStrategy.WEIGHTEDAVG:
                    smartContractUrl += 'weightedAvg';
                    break;
            }
            const { data: marketClearResponse } = await this.httpService.post<MarketClearResponseDto>(
                smartContractUrl,
                marketClearRequest,
            ).toPromise();
            round.mti = marketClearResponse.mti;
            round.isActive = false;
            await this.roundRepository.save(round);
            const users: User[] = [...round.buyerBids.map(o => o.user), ...round.sellerBids.map(o => o.user), ...utilities];
            const buyTransactions: BuyTransaction[] = marketClearResponse.buyers.map(o => {
                const buyTransaction = new BuyTransaction();
                buyTransaction.bsi = o.bsi;
                buyTransaction.averageBoughtPrice = o.avgBoughtPrice;
                buyTransaction.totalBoughtPrice = o.totalBoughtPrice;
                buyTransaction.utilityIndex = o.utilityIndex;
                buyTransaction.round = round;
                const user = users.find(u => o.id === u.id);
                buyTransaction.user = user;
                buyTransaction.userId = user.id;
                return buyTransaction;
            });
            await this.buyTransactionRepository.save(buyTransactions);
            const sellTransactions: SellTransaction[] = marketClearResponse.sellers.map(o => {
                const sellTransaction = new SellTransaction();
                sellTransaction.ssi = o.ssi;
                sellTransaction.averageSoldPrice = o.avgSoldPrice;
                sellTransaction.totalSoldPrice = o.totalSoldPrice;
                sellTransaction.utilityIndex = o.utilityIndex;
                sellTransaction.round = round;
                const user = users.find(u => o.id === u.id);
                sellTransaction.user = user;
                sellTransaction.userId = user.id;
                return sellTransaction;
            });
            await this.sellTransactionRepository.save(sellTransactions);
            const invoices: Invoice[] = [];
            marketClearResponse.sellers.forEach(sellTransaction => {
                sellTransaction.transaction.forEach(transaction => {
                    const invoice = new Invoice();
                    invoice.price = transaction.price;
                    invoice.quantity = transaction.quantity;
                    invoice.buyTransaction = buyTransactions.find(o => o.userId === transaction.id);
                    invoice.sellTransaction = sellTransactions.find(o => o.userId === sellTransaction.id);
                    invoices.push(invoice);
                });
            });
            await this.invoiceRepository.save(invoices);
        } catch (error) {
            throw new ServiceUnavailableException(error.toString());
        }
    }

}
