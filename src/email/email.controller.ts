import {Body, Controller, Post} from '@nestjs/common';
import {EmailService} from "./email.service";
import {SendEmailDTO} from "../interfaces/DTO/email.dto";

@Controller('email')
export class EmailController {
    constructor(private readonly emailService: EmailService) {}

    @Post('send')
    sendMail(@Body() dto: SendEmailDTO): Promise<{message: string}> {
        return this.emailService.sendEmail(dto);
    }
}
