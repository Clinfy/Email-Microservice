import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { EmailModule } from './email/email.module';
import { ConfigModule } from '@nestjs/config';
import { validate } from './config/env-validation';
import { WinstonModule } from 'nest-winston';
import winston from 'winston';
import 'winston-daily-rotate-file';
import { AllExceptionsFilter } from './common/filters/all-exceptions.filter';
import { AuthClientModule } from './clients/auth/auth-client.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true, validate }),

    //Winston Logger Module
    WinstonModule.forRoot({
      level: 'info',
      format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.errors({ stack: true }),
        winston.format.json(),
      ),
      transports: [
        //new winston.transports.Console(),
        new winston.transports.DailyRotateFile({
          filename: 'logs/error-%DATE%.log',
          datePattern: 'YYYY-MM-DD',
          level: 'error',
          maxSize: '5m',
          maxFiles: '14d',
        }),
        new winston.transports.DailyRotateFile({
          filename: 'logs/combined-%DATE%.log',
          datePattern: 'YYYY-MM-DD',
          maxSize: '10m',
          maxFiles: '30d',
        }),
      ],
    }),

    EmailModule,
    AuthClientModule,
  ],

  controllers: [AppController],
  providers: [AppService, AllExceptionsFilter],
})
export class AppModule {}
