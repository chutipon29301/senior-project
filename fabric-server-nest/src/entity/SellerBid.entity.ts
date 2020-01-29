import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne } from 'typeorm';
import Round from './Round.entity';

@Entity()
export default class SellerBid{
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column('float')
    price: number;

    @CreateDateColumn()
    timestamp: Date;

    @ManyToOne(_ => Round, round => round.sellerBids)
    round: Round;
}