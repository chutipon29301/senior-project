import { IsString, IsArray } from 'class-validator';

export class CreateUserDto {
    @IsString()
    username: string;
}

// tslint:disable-next-line: max-classes-per-file
export class CreateChannelDto {
    @IsString()
    channelName: string;

    @IsString()
    organizationName: string;
}

// tslint:disable-next-line: max-classes-per-file
export class JoinChannelDto {

    @IsString()
    channelName: string;

    @IsArray()
    peers: string[];

    @IsString()
    organizationName: string;
}

// tslint:disable-next-line: max-classes-per-file
export class GetChannelNameDto {
    @IsString()
    organizationName: string;

    @IsString()
    peer: string;
}

// tslint:disable-next-line: max-classes-per-file
export class InstantiateChaincodeDto {
    @IsString()
    channelName: string;

    @IsString()
    organizationName: string;
}

// tslint:disable-next-line: max-classes-per-file
export class InstallChaincodeDto {
    @IsString()
    organizationName: string;

    @IsArray()
    peers: string[];
}

// tslint:disable-next-line: max-classes-per-file
export class InvokeChaincodeDto {
    @IsArray()
    peers: string[];

    @IsString()
    channelName: string;

    @IsString()
    fcn: string;

    @IsArray()
    args: string[];

    @IsString()
    organizationName: string;

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
    organizationName: string;
}