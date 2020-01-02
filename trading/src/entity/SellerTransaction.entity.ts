import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from 'typeorm';
import Seller from './Seller.entity';
import Round from './Round.entity';

@Entity()
export class SellerTransaction {
    @PrimaryGeneratedColumn()
    id: number;

    @Column('float')
    ssi: number;

    @Column('float')
    soldPrice: number;

    @ManyToOne(_ => Seller, seller => seller.transactions)
    seller: Seller;

    @ManyToOne(_ => Round, round => round.sellerTransactions)
    round: Round;
}