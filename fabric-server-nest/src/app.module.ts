import { Module, MiddlewareConsumer } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { WinstonModule } from 'nest-winston';
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
import { APP_GUARD } from '@nestjs/core';
import { OrgGuard } from './guard/org.guard';
import { AuthHeaderParserMiddleware } from './middleware/auth-header-parser.middleware';

@Module({
  imports: [
    AuthModule,
    WinstonModule.forRoot({
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
    ConfigModule,
    OfferModule,
    RoundModule,
    TradeModule,
    FabricModule],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: APP_GUARD,
      useClass: OrgGuard,
    }],
})
export class AppModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(AuthHeaderParserMiddleware).forRoutes('*');
  }
}
