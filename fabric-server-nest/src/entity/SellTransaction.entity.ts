import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from 'typeorm';
import User from './User.entity';
import Round from './Round.entity';

@Entity()
export class SellTransaction {
    @PrimaryGeneratedColumn()
    id: number;

    @Column('float')
    ssi: number;

    @Column('float')
    averageSoldPrice: number;

    @Column('float')
    totalSoldPrice: number;

    @Column('float')
    utilityIndex: number;

    @ManyToOne(_ => User, user => user.sellTransactions)
    user: User;

    @ManyToOne(_ => Round, round => round.sellTransactions)
    round: Round;
}
