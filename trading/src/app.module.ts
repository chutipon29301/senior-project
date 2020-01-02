import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule } from './config/config.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigService } from './config/config.service';

@Module({
  imports: [TypeOrmModule.forRootAsync({
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
  }), ConfigModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule { }
