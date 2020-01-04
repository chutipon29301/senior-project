import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from 'typeorm';
import Round from './Round.entity';
import Building from './Building.entity';

@Entity()
export class BuyerTransaction {
    @PrimaryGeneratedColumn()
    id: number;

    @Column('float')
    bsi: number;

    @Column('float')
    boughtPrice: number;

    @ManyToOne(_ => Building, building => building.transactions)
    building: Building;

    @ManyToOne(_ => Round, round => round.buyerTransactions)
    round: Round;
}
