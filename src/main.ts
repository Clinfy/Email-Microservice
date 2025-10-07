import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import {writeFileSync} from "node:fs";
import {DocumentBuilder, SwaggerModule} from "@nestjs/swagger";

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

    //Swagger
    const config = new DocumentBuilder()
        .setTitle('Clinify Users Microservice')
        .setDescription('Docs')
        .setVersion('1.0')
        .addBearerAuth()
        .build();

    const document = SwaggerModule.createDocument(app, config);
    writeFileSync('./openapi.json', JSON.stringify(document, null, 2));
    SwaggerModule.setup('docs', app, document);

  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
