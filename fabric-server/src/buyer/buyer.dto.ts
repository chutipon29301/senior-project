import {IsPositive} from 'class-validator';

export class Price {
    @IsPositive()
    price: number;
}
