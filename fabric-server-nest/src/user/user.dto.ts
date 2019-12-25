
export interface Response{
        success: boolean;
        secret: any;
        message: string;
}

export class RegisterAndEnrollUserDto {
    username: string;
    orgName: string;
}
