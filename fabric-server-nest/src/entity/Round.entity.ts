import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import { SellTransaction } from './SellTransaction.entity';
import { BuyTransaction } from './BuyTransaction.entity';

@Entity()
export default class Round {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column()
    startDate: Date;

    @Column()
    endDate: Date;

    @Column('float')
    MTI: number;

    @Column('float')
    marketPrice: number;

    @Column()
    isActive: boolean;

    @OneToMany(_ => SellTransaction, sellerTransaction => sellerTransaction.round)
    sellTransactions: SellTransaction[];

    @OneToMany(_ => BuyTransaction, buyerTransaction => buyerTransaction.round)
    buyTransactions: BuyTransaction[];
}
