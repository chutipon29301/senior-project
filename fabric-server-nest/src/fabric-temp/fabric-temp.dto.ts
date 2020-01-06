import { IsString, IsArray, IsOptional } from 'class-validator';

export interface Response {
    success: boolean;
    secret: any;
    message: string;
}

export class RegisterAndEnrollUserDto {

    @IsString()
    username: string;

    @IsString()
    orgName: string;
}

// tslint:disable-next-line: max-classes-per-file
export class CreateChannelDto {

    @IsString()
    channelName: string;

    @IsString()
    username: string;

    @IsString()
    orgName: string;

}

// tslint:disable-next-line: max-classes-per-file
export class JoinChannelDto {

    @IsString()
    channelName: string;

    @IsArray()
    peers: string[];

    @IsString()
    username: string;

    @IsString()
    orgName: string;
}

// tslint:disable-next-line: max-classes-per-file
export class UpdateAnchorPeersDto {

    @IsString()
    channelName: string;

    @IsString()
    configUpdatePath: string;

    @IsString()
    username: string;

    @IsString()
    orgName: string;
}

// tslint:disable-next-line: max-classes-per-file
export class InstallChaincodeDto {

    @IsArray()
    peers: string[];

    @IsString()
    username: string;

    @IsString()
    orgName: string;
}

// tslint:disable-next-line: max-classes-per-file
export class InstantiateChaincodeDto {

    @IsOptional()
    @IsArray()
    peers: string[];

    @IsString()
    channelName: string;

    @IsOptional()
    @IsString()
    functionName: string;

    @IsArray()
    args: string[];

    @IsString()
    username: string;

    @IsString()
    orgName: string;
}

// tslint:disable-next-line: max-classes-per-file
export class InvokeChaincodeDto {
    @IsArray()
    peers: string[];

    @IsString()
    channelName: string;

    @IsString()
    chaincodeName: string;

    @IsString()
    functionName: string;

    @IsArray()
    args: string[];

    @IsString()
    username: string;

    @IsString()
    orgName: string;
}

// tslint:disable-next-line: max-classes-per-file
export class QueryChaincodeParamDto {
    @IsString()
    channelName: string;

    @IsString()
    chaincodeName: string;

    @IsString()
    functionName: string;
}

// tslint:disable-next-line: max-classes-per-file
export class QueryChaincodeQueryDto {
    @IsString()
    peer: string;

    @IsString()
    args: string;

    @IsString()
    username: string;

    @IsString()
    orgName: string;
}