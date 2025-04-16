import 'tsconfig-paths/register'; 
import { NestFactory } from "@nestjs/core"
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from "@nestjs/swagger" 
import { AppModule } from "./app.module"

async function bootstrap () {
    const app = await NestFactory.create(AppModule)

    app.useGlobalPipes(new ValidationPipe({ 
        whitelist: true,
        transform: true,
        transformOptions: {
            enableImplicitConversion: true,
        }
    }))
    app.enableCors()

    const config = new DocumentBuilder()
        .setTitle("API de jogos")
        .setDescription("API teste técnico")
        .setVersion("1.0")
        .addTag("api")
        .addBearerAuth(
            {
                type: "http",
                scheme: "bearer",
                bearerFormat: "JWT",
                name: "Authorization",
                description: 'enter JWT token',
                in: "header",
            },
            'access-token',
        )
        .build()

    const document = SwaggerModule.createDocument(app, config)
    SwaggerModule.setup("api", app, document)

    await app.listen(3000)
}

bootstrap()