import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import { SellTransaction } from './SellTransaction.entity';
import { BuyTransaction } from './BuyTransaction.entity';
import BuyerBid from './BuyerBid.entity';
import SellerBid from './SellerBid.entity';

export enum MarketClearingStrategy {
    DISKDA = 'disKDA',
    UNIKDA = 'uniKDA',
    WEIGHTEDAVG = 'weightedAVG',
}

@Entity()
export default class Round {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column()
    startDate: Date;

    @Column()
    endDate: Date;

    @Column('float', {
        nullable: true,
    })
    mti: number;

    @Column('float', {
        nullable: true,
    })
    marketPrice: number;

    @Column({
        default: true,
    })
    isActive: boolean;
 
    @Column({
        type: 'enum',
        enum: MarketClearingStrategy,
    })
    strategy: MarketClearingStrategy;

    @OneToMany(_ => SellTransaction, sellerTransaction => sellerTransaction.round)
    sellTransactions: SellTransaction[];

    @OneToMany(_ => BuyTransaction, buyerTransaction => buyerTransaction.round)
    buyTransactions: BuyTransaction[];

    @OneToMany(_ => BuyerBid, buyerBid => buyerBid.round)
    buyerBids: BuyerBid[];

    @OneToMany(_ => SellerBid, sellerBid => sellerBid.round)
    sellerBids: SellerBid[];
}
