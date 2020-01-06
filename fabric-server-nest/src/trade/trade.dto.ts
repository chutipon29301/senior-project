import { IsString, IsNumber } from 'class-validator';

export class TradeDto {
    @IsNumber()
    quantity: number;

    @IsNumber()
    price: number;
}
