import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import * as winston from 'winston';
import { WinstonModule } from 'nest-winston';
import { UserModule } from './user/user.module';
import { ClientModule } from './client/client.module';
import { ChannelModule } from './channel/channel.module';
import { ChaincodeModule } from './chaincode/chaincode.module';

@Module({
  imports: [WinstonModule.forRoot({
    transports: [new winston.transports.Console()],
  }), UserModule, ClientModule, ChannelModule, ChaincodeModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule { }
