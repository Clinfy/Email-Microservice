import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { EmailService } from './email/email.service';
import { EmailModule } from './email/email.module';
import { ConfigModule } from '@nestjs/config';
@Module({
  imports: [EmailModule, ConfigModule.forRoot()],
  controllers: [AppController],
  providers: [AppService, EmailService],
})
export class AppModule {}
