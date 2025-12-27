import { ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import cookieParser from 'cookie-parser';
import session from 'express-session';

import { AppModule } from './app.module';
import { CsrfMiddleware } from './common/middleware/csrf.middleware';
import { CsrfService } from './common/services/csrf.service';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  const configService = app.get(ConfigService);

  // Set global prefix for all routes
  app.setGlobalPrefix('v1');

  // Disable for error in OAuth callback
  // app.use(
  //   helmet({
  //     contentSecurityPolicy: {
  //       directives: {
  //         defaultSrc: ["'self'"],
  //         styleSrc: ["'self'", "'unsafe-inline'"],
  //         scriptSrc: ["'self'", "'unsafe-inline'", "'unsafe-eval'"],
  //         imgSrc: ["'self'", 'data:', 'https:'],
  //         connectSrc: [
  //           "'self'",
  //           'https://oauth2.googleapis.com',
  //           'https://www.googleapis.com',
  //           'https://github.com',
  //           'https://api.github.com',
  //         ],
  //       },
  //     },
  //     crossOriginEmbedderPolicy: false,
  //   })
  // );

  // Enable cookie parser for JWT tokens
  app.use(cookieParser());
  app.set('trust proxy', true);

  const isProduction = process.env.NODE_ENV === 'production';
  app.use(
    session({
      secret: configService.getOrThrow<string>('SESSION_SECRET'),
      resave: false,
      saveUninitialized: true,
      cookie: {
        secure: isProduction,
        sameSite: 'lax', // Always lax for multiple ports/subdomains
      },
    })
  );

  // Setup CSRF protection
  const csrfService = app.get(CsrfService);
  const csrfMiddleware = new CsrfMiddleware(csrfService);
  app.use(csrfMiddleware.use.bind(csrfMiddleware));
  // Enable CORS
  app.enableCors({
    origin: configService.get<string>('CORS_ORIGIN', 'http://localhost:3000'),
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: [
      'Content-Type',
      'Authorization',
      'Accept',
      'X-Requested-With',
      'X-CSRF-Token',
    ],
    exposedHeaders: ['Content-Type', 'Authorization'],
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
    .setTitle('WebDev Studios API')
    .setVersion('1.0.0')
    .addBearerAuth()
    .addCookieAuth('access_token')
    .addCookieAuth('refresh_token')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  // Swagger UI available under the API global prefix: /v1/docs
  SwaggerModule.setup('v1/docs', app, document, {
    swaggerOptions: {
      persistAuthorization: true,
    },
  });

  const port = configService.get<number>('PORT', 4000);
  await app.listen(port);
  console.log(`🚀 API server running on http://localhost:${port}/v1`);
  console.log(`📚 Swagger docs available at http://localhost:${port}/v1/docs`);
}

void bootstrap();
