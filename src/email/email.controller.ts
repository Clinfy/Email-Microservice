import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { EmailService } from './email.service';
import { SendEmailDTO } from '../DTO/email.dto';
import { ApiKeyGuard } from '../middlewares/api-key.middleware';
import { Permissions } from '../middlewares/decorators/permissions.decorator';
import {
  ApiBasicAuth,
  ApiBody,
  ApiCreatedResponse,
  ApiOperation,
} from '@nestjs/swagger';
import { Ctx, EventPattern, Payload, RmqContext } from '@nestjs/microservices';

@Controller('email')
export class EmailController {
  constructor(private readonly emailService: EmailService) {}

  @UseGuards(ApiKeyGuard)
  @Permissions(['EMAIL_SEND'])
  @ApiBasicAuth()
  @ApiOperation({ summary: "Send's an email using nodemailer" })
  @ApiBody({ type: SendEmailDTO })
  @ApiCreatedResponse({
    schema: { type: 'object', properties: { message: { type: 'string' } } },
  })
  @Post('send')
  sendMail(@Body() dto: SendEmailDTO): Promise<{ message: string }> {
    return this.emailService.sendEmail(dto);
  }

  @EventPattern('email_queue')
  async handleEmailQueue(@Payload() dto: SendEmailDTO, @Ctx() context: RmqContext) {
    const channel = context.getChannelRef();
    const originalMsg = context.getMessage();
    try {
      const msg = await this.emailService.sendEmail(dto);
      channel.ack(originalMsg);
      return msg;
    } catch (error) {

      console.error('Error processing email queue message:', error);
    }
  }
}
