import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, OneToMany } from 'typeorm';
import User from './User.entity';
import Round from './Round.entity';
import Invoice from './Invoice.entity';

@Entity()
export default class SellTransaction {
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

    @Column()
    userId: string;

    @ManyToOne(_ => User, user => user.sellTransactions)
    user: User;

    @ManyToOne(_ => Round, round => round.sellTransactions)
    round: Round;

    @OneToMany(_ => Invoice, invoice => invoice.sellTransaction)
    invoices: Invoice[];
}
