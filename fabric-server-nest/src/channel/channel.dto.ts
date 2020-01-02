import { IsString, IsArray } from 'class-validator';

export class CreateChannelDto {

    @IsString()
    channelName: string;

    @IsString()
    username: string;

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
    username: string;

    @IsString()
    organizationName: string;
}

// tslint:disable-next-line: max-classes-per-file
export class UpdateAnchorPeersDto {

    @IsString()
    configUpdatePath: string;

    @IsString()
    username: string;

    @IsString()
    organizationName: string;
}
