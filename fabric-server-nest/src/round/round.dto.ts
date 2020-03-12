import { IsISO8601, IsString, IsNumber, IsUUID } from 'class-validator';

export class CreateRoundDto {
    @IsISO8601()
    startDate: string;

    @IsISO8601()
    endDate: string;

}

// tslint:disable-next-line: max-classes-per-file
export class SmartMeterResponse {
    @IsString()
    id: string;

    @IsNumber()
    quantity: number;
}

// tslint:disable-next-line: max-classes-per-file
export class ClearMarketDto {
    @IsUUID()
    roundId: string;
}

// tslint:disable-next-line: max-classes-per-file
export class MarketClearRequestDto {
    buyers: OfferDto[];
    sellers: OfferDto[];
    utilities: string[];
}

// tslint:disable-next-line: max-classes-per-file
export class OfferDto {
    id: string;
    quantity: number;
    bidPrice: number;
    timestamp: Date;
}

// tslint:disable-next-line: max-classes-per-file
export class MarketClearResponseDto {
    mti: number;
    buyers: MarketClearBuyerResponseDto[];
    sellers: MarketClearSellerResponseDto[];
}

// tslint:disable-next-line: max-classes-per-file
export class MarketClearBuyerResponseDto {
    id: string;
    bsi: number;
    totalBoughtPrice: number;
    utilityIndex: number;
    avgBoughtPrice: number;
}

// tslint:disable-next-line: max-classes-per-file
export class MarketClearSellerResponseDto {
    id: string;
    ssi: number;
    totalSoldPrice: number;
    transaction: MarketClearTransactionDto[];
    utilityIndex: number;
    avgSoldPrice: number;
}

// tslint:disable-next-line: max-classes-per-file
export class MarketClearTransactionDto {
    id: string;
    price: number;
    quantity: number;
}
