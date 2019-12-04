import { IsPositive } from 'class-validator';

export class Price {
    @IsPositive()
    price: number;
}

// tslint:disable-next-line: max-classes-per-file
export class Quantity {
    @IsPositive()
    quantity: number;
}
