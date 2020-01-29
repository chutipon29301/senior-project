import { PrimaryGeneratedColumn, Entity, Column, CreateDateColumn, ManyToOne } from 'typeorm';
import Round from './Round.entity';

@Entity()
export default class BuyerBid {

    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column('float')
    price: number;

    @CreateDateColumn()
    timestamp: Date;

    @ManyToOne(_ => Round, round => round.buyerBids)
    round: Round;
}
