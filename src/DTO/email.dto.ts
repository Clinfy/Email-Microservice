import {IsEmail, IsNotEmpty, IsOptional, IsString} from "class-validator";

export class SendEmailDTO {
    @IsNotEmpty({message: 'Recipient/s is/are required'})
    @IsEmail({}, {each: true, message: 'Invalid email format'})
    recipient: string[];

    @IsNotEmpty({message: 'Subject is required'})
    @IsString({message: 'Subject must be a string'})
    subject: string;

    @IsNotEmpty({message: 'HTML is required'})
    @IsString({message: 'HTML is required'})
    html: string;

    @IsOptional()
    @IsString({ message: 'Text must be a string'})
    text?: string;
}