import { IsString } from 'class-validator';

export class JwtToken {
    token: string;
}

// tslint:disable-next-line: max-classes-per-file
export class CreateTokenDto {
    @IsString()
    id: string;
}
