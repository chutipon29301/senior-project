import { IsString, IsArray } from 'class-validator';
import { Type } from 'class-transformer';
export class CreateUserDto {
    @IsString()
    username: string;
}

// tslint:disable-next-line: max-classes-per-file
export class GetChannelNameDto {
    @IsString()
    peer: string;
}

// tslint:disable-next-line: max-classes-per-file
export class InvokeChaincodeDto {

    @IsString()
    fcn: string;

    @IsArray()
    args: string[];

}

// tslint:disable-next-line: max-classes-per-file
export class QueryChaincodeParamDto {
    @IsString()
    functionName: string;
}

// tslint:disable-next-line: max-classes-per-file
export class QueryChaincodeQueryDto {
    @IsString()
    args: string;
}

// tslint:disable-next-line: max-classes-per-file
export class ChaincodeRoundDto {
    @Type(() => BuyerBid)
    buyerBids: BuyerBid[];

    @Type(() => SellerBid)
    sellerBids: SellerBid[];

    @Type(() => Invoice)
    invoices: Invoice[];

    @Type(() => Date)
    modifyDate: Date;
}

// tslint:disable-next-line: max-classes-per-file
export class BuyerBid {
    id: string;

    @Type(() => Number)
    price: number;

    @Type(() => Date)
    timestamp: Date;
}

// tslint:disable-next-line: max-classes-per-file
export class SellerBid {
    id: string;

    @Type(() => Number)
    price: number;

    @Type(() => Date)
    timestamp: Date;
}

// tslint:disable-next-line: max-classes-per-file
export class Invoice {
    buyerId: string;

    sellerId: string;

    @Type(() => Number)
    quantity: number;

    @Type(() => Number)
    price: number;
}