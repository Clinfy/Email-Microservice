import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { EmailModule } from './email/email.module';
import { ConfigModule } from '@nestjs/config';
import { validate } from './config/env-validation';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true, validate }),
    EmailModule
  ],

  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
