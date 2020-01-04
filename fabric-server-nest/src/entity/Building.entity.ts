import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import { BuyerTransaction } from './BuyerTransaction.entity';

@Entity()
export default class Building {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column()
    name: string;

    @OneToMany(_ => BuyerTransaction, buyerTransaction => buyerTransaction.building)
    transactions: BuyerTransaction[];
}
