import {Body, Controller, Post, UseGuards} from '@nestjs/common';
import {EmailService} from "./email.service";
import {SendEmailDTO} from "../DTO/email.dto";
import {ApiKeyGuard} from "../middlewares/api-key.middleware";
import {Permissions} from "../middlewares/decorators/permissions.decorator";


@Controller('email')
export class EmailController {
    constructor(private readonly emailService: EmailService) {}

    @UseGuards(ApiKeyGuard)
    @Permissions(['EMAIL_SEND'])
    @Post('send')
    sendMail(@Body() dto: SendEmailDTO): Promise<{message: string}> {
        return this.emailService.sendEmail(dto);
    }
}
