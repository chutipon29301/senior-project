import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import { SellerTransaction } from './SellerTransaction.entity';

@Entity()
export default class Seller {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column()
    name: string;

    @OneToMany(_ => SellerTransaction, sellerTransaction => sellerTransaction.seller)
    transactions: SellerTransaction[];
}
