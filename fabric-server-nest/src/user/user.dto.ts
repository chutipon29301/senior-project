import { IsString } from 'class-validator';

export interface Response {
    success: boolean;
    secret: any;
    message: string;
}

export class RegisterAndEnrollUserDto {

    @IsString()
    username: string;

    @IsString()
    organizationName: string;
}
