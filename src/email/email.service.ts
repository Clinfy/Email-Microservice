import {Injectable} from '@nestjs/common';
import {createTransport} from "nodemailer";
import {ConfigService} from "@nestjs/config";
import {SendEmailDTO} from "../interfaces/DTO/email.dto";

@Injectable()
export class EmailService {
    constructor(private readonly configService: ConfigService) {}

    async sendEmail(dto: SendEmailDTO): Promise<{message: string}> {
        const transport = this.emailTransport();
        try {
            await transport.sendMail({
                from: this.configService.get<string>('EMAIL_USER'),
                to: dto.recipient,
                subject: dto.subject,
                html: dto.html,
                text: dto.text,
            })
            return {message: 'Email sent successfully'};
        }catch (e) {
            throw new Error(e);
        }
    }

    private emailTransport(){
        return createTransport({
            host: this.configService.get<string>('EMAIL_HOST'),
            port: this.configService.get<number>('EMAIL_PORT'),
            secure: false,
            auth: {
                user: this.configService.get<string>('EMAIL_USER'),
                pass: this.configService.get<string>('EMAIL_PASS'),
            }
        });
    }
}
