import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import { SellerTransaction } from './SellerTransaction.entity';
import { BuyerTransaction } from './BuyerTransaction.entity';

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

    @OneToMany(_ => SellerTransaction, sellerTransaction => sellerTransaction.round)
    sellerTransactions: SellerTransaction[];

    @OneToMany(_ => BuyerTransaction, buyerTransaction => buyerTransaction.round)
    buyerTransactions: BuyerTransaction[];
}
