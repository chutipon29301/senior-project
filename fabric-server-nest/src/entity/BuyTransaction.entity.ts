import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from 'typeorm';
import Round from './Round.entity';
import User from './User.entity';

@Entity()
export class BuyTransaction {
    @PrimaryGeneratedColumn()
    id: number;

    @Column('float')
    bsi: number;

    @Column('float')
    averageBoughtPrice: number;

    @Column('float')
    totalBoughtPrice: number;

    @Column('float')
    utilityIndex: number;

    @ManyToOne(_ => User, user => user.buyTransactions)
    user: User;

    @ManyToOne(_ => Round, round => round.buyTransactions)
    round: Round;
}
