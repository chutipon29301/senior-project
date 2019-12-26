import { IsArray, IsString } from 'class-validator';

export class InstallChaincodeDto {

    @IsArray()
    peers: string[];

    @IsString()
    username: string;

    @IsString()
    orgName: string;
}