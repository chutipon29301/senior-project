import { IsString, IsArray } from 'class-validator';

export class CreateUserDto {
    @IsString()
    username: string;
}

// tslint:disable-next-line: max-classes-per-file
export class CreateChannelDto {
    @IsString()
    channelName: string;
}

// tslint:disable-next-line: max-classes-per-file
export class JoinChannelDto {

    @IsString()
    channelName: string;
}

// tslint:disable-next-line: max-classes-per-file
export class GetChannelNameDto {
    @IsString()
    peer: string;
}

// tslint:disable-next-line: max-classes-per-file
export class InstantiateChaincodeDto {
    @IsString()
    channelName: string;
}

// tslint:disable-next-line: max-classes-per-file
export class InstallChaincodeDto {
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
}