import { Module } from '@nestjs/common';
import { BffController } from './bff.controller';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [ConfigModule],
  controllers: [BffController],
})
export class BffModule {}
