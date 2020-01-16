import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Observable } from 'rxjs';
import User, { Organization } from '../entity/User.entity';
import { AuthService } from '../auth/auth.service';

@Injectable()
export class OrgGuard implements CanActivate {
    constructor(private readonly reflector: Reflector, private readonly authService: AuthService) { }

    canActivate(context: ExecutionContext): boolean | Promise<boolean> | Observable<boolean> {
        const orgs = this.reflector.get<Organization[]>('orgs', context.getHandler());
        if (!orgs) {
            return true;
        }
        const { user } = context.switchToHttp().getRequest() as { user: User };
        if (!user) {
            return false;
        }
        if (orgs.length === 0) {
            return true;
        }
        return orgs.indexOf(user.organization) > -1;
    }
}
