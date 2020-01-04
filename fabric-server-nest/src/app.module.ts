import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { WinstonModule } from 'nest-winston';
import { UserModule } from './user/user.module';
import { ClientModule } from './client/client.module';
import { ChannelModule } from './channel/channel.module';
import { ChaincodeModule } from './chaincode/chaincode.module';
import { FabricModule } from './fabric/fabric.module';
import { ConfigModule } from './config/config.module';
import { BuildingModule } from './building/building.module';
import { OfferModule } from './offer/offer.module';
import { RoundModule } from './round/round.module';
import { SellerModule } from './seller/seller.module';
import { TradeModule } from './trade/trade.module';
import { ConfigService } from './config/config.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from './config/config.module';
import * as winston from 'winston';

@Module({
  imports: [WinstonModule.forRoot({
    transports: [new winston.transports.Console()],
  }),
  TypeOrmModule.forRootAsync({
    imports: [ConfigModule],
    inject: [ConfigService],
    useFactory: (configService: ConfigService) => ({
      type: 'mysql',
      host: configService.mySQLUrl,
      port: +configService.mySQLPort,
      username: configService.mySQLUsername,
      password: configService.mySQLPassword,
      database: configService.mySQLDatabaseName,
      entities: [__dirname + '/**/*.entity{.ts,.js}'],
      synchronize: true,
    }),
  }),
    UserModule,
    ClientModule,
    ChannelModule,
    ChaincodeModule,
    FabricModule,
    ConfigModule,
    BuildingModule,
    OfferModule,
    RoundModule,
    SellerModule,
    TradeModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule { }
