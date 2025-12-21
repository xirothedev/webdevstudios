import { ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import cookieParser from 'cookie-parser';

import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const configService = app.get(ConfigService);

  // Set global prefix for all routes
  app.setGlobalPrefix('v1');

  // Enable cookie parser for JWT tokens
  app.use(cookieParser());

  // Enable CORS
  app.enableCors({
    origin: configService.get<string>('CORS_ORIGIN', 'http://localhost:3000'),
    credentials: true,
  });

  // Global validation pipe
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: true,
    })
  );

  // Swagger configuration
  const config = new DocumentBuilder()
    .setTitle('Savi API')
    .setVersion('1.0.0')
    .addBearerAuth()
    .addCookieAuth('access_token')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  // Swagger UI available under the API global prefix: /v1/docs
  SwaggerModule.setup('v1/docs', app, document);

  const port = configService.get<number>('PORT', 4000);
  await app.listen(port);
  console.log(`🚀 API server running on http://localhost:${port}/v1`);
  console.log(`📚 Swagger docs available at http://localhost:${port}/v1/docs`);
}

void bootstrap();
