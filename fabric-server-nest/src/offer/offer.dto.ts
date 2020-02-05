import { IsPositive, IsString, IsISO8601 } from 'class-validator';

export class CreateOfferDto {
    @IsPositive()
    price: number;

    @IsISO8601()
    date: string;

}