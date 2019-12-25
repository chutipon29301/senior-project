export class CreateChannelDto {
    channelName: string;
    username: string;
    orgName: string;
}

// tslint:disable-next-line: max-classes-per-file
export class JoinChannelDto {
    channelName: string;
    peers: string[];
    username: string;
    orgName: string;
}