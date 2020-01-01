import { Module } from '@nestjs/common';
import { UserService } from './user.service';
import { UserController } from './user.controller';
import {JwtModule} from '@nestjs/jwt';
import { ClientModule } from '../client/client.module';

@Module({
  imports: [JwtModule.register({
    secret: 'secret',
  }), ClientModule],
  providers: [UserService],
  controllers: [UserController],
})
export class UserModule { }
