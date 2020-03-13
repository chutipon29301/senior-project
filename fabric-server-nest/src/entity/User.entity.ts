import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import BuyTransaction from './BuyTransaction.entity';
import SellTransaction from './SellTransaction.entity';
import BuyerBid from './BuyerBid.entity';
import SellerBid from './SellerBid.entity';

export enum Organization {
    Utility = 'Utility',
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
        enum: Organization,
    })
    organization: Organization;

    @Column({ nullable: true })
    smartMeterId: string;

    @OneToMany(_ => BuyTransaction, buyTransaction => buyTransaction.user)
    buyTransactions: BuyTransaction[];

    @OneToMany(_ => SellTransaction, sellTransaction => sellTransaction.user)
    sellTransactions: SellTransaction[];

    @OneToMany(_ => BuyerBid, buyerBid => buyerBid.user)
    buyerBids: BuyerBid[];

    @OneToMany(_ => SellerBid, sellerBid => sellerBid.user)
    sellerBids: SellerBid[];
}
