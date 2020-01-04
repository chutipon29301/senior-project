import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import { BuyTransaction } from './BuyTransaction.entity';
import { SellTransaction } from './SellTransaction.entity';

export enum UserType {
    Building = 'Building',
    PV = 'PV',
}

@Entity()
export default class User {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column()
    name: string;

    @Column({
        type: 'enum',
        enum: UserType,
    })
    type: UserType;

    @OneToMany(_ => BuyTransaction, buyTransaction => buyTransaction.user)
    buyTransactions: BuyTransaction[];

    @OneToMany(_ => SellTransaction, sellTransaction => sellTransaction.user)
    sellTransactions: SellTransaction[];
}
