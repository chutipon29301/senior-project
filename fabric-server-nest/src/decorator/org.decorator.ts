import { Organization } from '../entity/User.entity';
import { SetMetadata } from '@nestjs/common';

export const Orgs = (...orgs: Organization[]) => SetMetadata('orgs', orgs);
