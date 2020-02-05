import { PrimaryGeneratedColumn, Entity, Column, CreateDateColumn, ManyToOne, OneToMany } from 'typeorm';
import Round from './Round.entity';
import User from './User.entity';

@Entity()
export default class BuyerBid {

    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column('float')
    price: number;

    @CreateDateColumn()
    timestamp: Date;

    @ManyToOne(_ => User, user => user.buyerBids)
    user: User;

    @ManyToOne(_ => Round, round => round.buyerBids)
    round: Round;
}
