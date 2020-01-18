import {IsISO8601} from 'class-validator';

export class CreateRoundDto {
    @IsISO8601()
    startDate: string;

    @IsISO8601()
    endDate: string;

}
