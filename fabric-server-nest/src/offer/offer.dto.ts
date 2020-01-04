import { IsString, IsNumber } from 'class-validator';

export class OfferDto {
    @IsString()
    id: string;

    @IsNumber()
    price: number;
}
