import { Injectable, NestMiddleware } from '@nestjs/common';
import { NextFunction, Request, Response } from 'express';
import { AuthService } from '../auth/auth.service';
import User from '../entity/User.entity';

declare global {
    namespace Express {
        interface Request {
            user?: User;
        }
    }
}

@Injectable()
export class AuthHeaderParserMiddleware implements NestMiddleware {

    constructor(private readonly authService: AuthService) { }

    async use(req: Request, res: Response, next: NextFunction) {
        try {
            const user = await this.authService.decodeToken(req.headers.authorization.split(' ')[1]);
            req.user = user;
            next();
        } catch (_) {
            req.user = null;
            next();
        }
    }
}
