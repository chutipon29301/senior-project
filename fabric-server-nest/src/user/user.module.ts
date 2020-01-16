import { Module } from '@nestjs/common';
import { UserService } from './user.service';
import { UserController } from './user.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import User from '../entity/User.entity';
import { FabricModule } from '../fabric/fabric.module';

@Module({
  imports: [TypeOrmModule.forFeature([User]), FabricModule],
  providers: [UserService],
  controllers: [UserController],
  exports: [UserService],
})
export class UserModule { }
