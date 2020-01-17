import { Module } from '@nestjs/common';
import { FabricService } from './fabric.service';
import { FabricController } from './fabric.controller';
import { ConfigModule } from '../config/config.module';
import { UserModule } from '../user/user.module';

@Module({
  imports: [ConfigModule],
  providers: [FabricService],
  controllers: [FabricController],
  exports: [FabricService],
})
export class FabricModule {}
