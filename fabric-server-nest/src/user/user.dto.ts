import { IsString, IsEnum } from 'class-validator';
import { Organization } from '../entity/User.entity';

export class CreateUserDto {
    @IsString()
    name: string;

    @IsEnum(Organization)
    organizationName: Organization;
}
