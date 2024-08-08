import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { BffModule } from './bff/bff.module';

@Module({
  imports: [ConfigModule.forRoot({ isGlobal: true }), BffModule],
})
export class AppModule {}
