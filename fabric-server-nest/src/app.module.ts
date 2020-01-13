import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { WinstonModule } from 'nest-winston';
import { FabricTempModule } from './fabric-temp/fabric-temp.module';
import { OfferModule } from './offer/offer.module';
import { RoundModule } from './round/round.module';
import { TradeModule } from './trade/trade.module';
import { ConfigService } from './config/config.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from './config/config.module';
import { UserModule } from './user/user.module';
import { FabricModule } from './fabric/fabric.module';
import { AuthModule } from './auth/auth.module';
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
      username: configService.mySQLUser,
      password: configService.mySQLPassword,
      database: configService.mySQLDatabaseName,
      entities: [__dirname + '/**/*.entity{.ts,.js}'],
      synchronize: true,
    }),
  }),
    UserModule,
    FabricTempModule,
    ConfigModule,
    OfferModule,
    RoundModule,
    TradeModule,
    FabricModule,
    AuthModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule { }
