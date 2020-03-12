import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, OneToMany } from 'typeorm';
import Round from './Round.entity';
import User from './User.entity';
import Invoice from './Invoice.entity';

@Entity()
export default class BuyTransaction {
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

    @Column()
    userId: string;

    @ManyToOne(_ => User, user => user.buyTransactions)
    user: User;

    @ManyToOne(_ => Round, round => round.buyTransactions)
    round: Round;

    @OneToMany(_ => Invoice, invoice => invoice.buyTransaction)
    invoices: Invoice[];

}
