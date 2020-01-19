import { IsPositive, IsString } from 'class-validator';

export class CreateOfferDto {
    @IsPositive()
    price: number;

    @IsString()
    roundId: string;
}