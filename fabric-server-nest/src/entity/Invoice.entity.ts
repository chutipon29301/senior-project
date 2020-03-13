import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from 'typeorm';
import BuyTransaction from './BuyTransaction.entity';
import SellTransaction from './SellTransaction.entity';

@Entity()
export default class Invoice {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column('float')
    price: number;

    @Column('float')
    quantity: number;

    @ManyToOne(_ => BuyTransaction, buyInvoice => buyInvoice.invoices)
    buyTransaction: BuyTransaction;

    @ManyToOne(_ => SellTransaction, sellInvoice => sellInvoice.invoices)
    sellTransaction: SellTransaction;

}
