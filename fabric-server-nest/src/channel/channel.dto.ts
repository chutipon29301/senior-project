import { IsString, IsArray } from 'class-validator';

export class CreateChannelDto {
    channelName: string;
    username: string;
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
    configUpdatePath: string;

    @IsString()
    username: string;

    @IsString()
    orgName: string;
}
