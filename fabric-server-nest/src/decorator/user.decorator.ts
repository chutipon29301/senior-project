import { createParamDecorator } from '@nestjs/common';
import User from '../entity/User.entity';

export const RequestUser = createParamDecorator(
    (data, req): User => {
        return req.user;
    },
);
