import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne } from 'typeorm';
import Round from './Round.entity';
import User from './User.entity';

@Entity()
export default class SellerBid{

    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column('float')
    price: number;

    @CreateDateColumn()
    timestamp: Date;

    @Column()
    userId: string;

    @ManyToOne(_ => User, user => user.sellerBids)
    user: User;

    @ManyToOne(_ => Round, round => round.sellerBids)
    round: Round;
}