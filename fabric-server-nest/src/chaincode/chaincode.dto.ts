import { IsArray, IsString, IsOptional } from 'class-validator';

export class InstallChaincodeDto {

    @IsArray()
    peers: string[];

    @IsString()
    username: string;

    @IsString()
    organizationName: string;
}

// tslint:disable-next-line: max-classes-per-file
export class InstantiateChaincodeDto {

    @IsOptional()
    @IsArray()
    peers: string[];

    @IsOptional()
    @IsString()
    functionName: string;

    @IsArray()
    args: string[];

    @IsString()
    username: string;

    @IsString()
    organizationName: string;
}

// tslint:disable-next-line: max-classes-per-file
export class InvokeChaincodeDto {

    @IsArray()
    peers: string[];

    @IsString()
    fcn: string;

    @IsArray()
    args: string[];

    @IsString()
    username: string;

    @IsString()
    organizationName: string;
}

// tslint:disable-next-line: max-classes-per-file
export class GetChaincodeFromPeerDto {

    @IsString()
    args: string;

    @IsString()
    fcn: string;

    @IsString()
    peer: string;

    @IsString()
    username: string;

    @IsString()
    orgName: string;
}

// tslint:disable-next-line: max-classes-per-file
export class GetBlockByNumberDto {
    @IsString()
    peer: string;
    @IsString()
    username: string;
    @IsString()
    orgName: string;
}

// tslint:disable-next-line: max-classes-per-file
export class GetTransactionBuTransactionID {
    @IsString()
    peer: string;
    @IsString()
    username: string;
    @IsString()
    orgName: string;
}

export interface Response {
    success: boolean;
    message: string;
}
