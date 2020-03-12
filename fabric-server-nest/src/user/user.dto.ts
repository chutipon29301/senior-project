import { IsString, IsEnum, IsOptional } from 'class-validator';
import { Organization } from '../entity/User.entity';

export class CreateUserDto {
    @IsString()
    name: string;

    @IsOptional()
    @IsString()
    smartMeterId?: string;

    @IsEnum(Organization)
    organizationName: Organization;
}
