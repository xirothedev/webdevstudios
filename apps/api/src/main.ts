/**
 * Copyright (c) 2026 Xiro The Dev <lethanhtrung.trungle@gmail.com>
 *
 * Source Available License
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to:
 * - View and study the Software for educational purposes
 * - Fork this repository on GitHub for personal reference
 * - Share links to this repository
 *
 * THE FOLLOWING ARE PROHIBITED:
 * - Using the Software in production or commercial applications
 * - Copying substantial portions of the Software into other projects
 * - Distributing modified versions of the Software
 * - Removing or altering copyright notices
 *
 * For commercial licensing or usage permissions, contact: lethanhtrung.trungle@gmail.com
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND.
 */

import { ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import cookieParser from 'cookie-parser';
import basicAuth from 'express-basic-auth';
import session from 'express-session';

import { AppModule } from './app.module';
import { CsrfMiddleware } from './common/middleware/csrf.middleware';
import { CsrfService } from './common/services/csrf.service';
import { SecurityLoggerService } from './common/services/security-logger.service';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  const configService = app.get(ConfigService);

  // Set global prefix for all routes
  app.setGlobalPrefix('v1');

  // Enable CORS first - Must be before any other middleware
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
    preflightContinue: false,
    optionsSuccessStatus: 204,
  });

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
  const securityLogger = app.get(SecurityLoggerService);
  const csrfMiddleware = new CsrfMiddleware(csrfService, securityLogger);
  app.use(csrfMiddleware.use.bind(csrfMiddleware));

  // Global validation pipe
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: true,
    })
  );

  // Swagger configuration
  // Protect Swagger with Basic Auth in production
  if (isProduction) {
    const swaggerUsername =
      configService.getOrThrow<string>('SWAGGER_USERNAME');
    const swaggerPassword =
      configService.getOrThrow<string>('SWAGGER_PASSWORD');

    app.use(
      '/v1/docs',
      basicAuth({
        users: { [swaggerUsername]: swaggerPassword },
        challenge: true,
        realm: 'Swagger API Docs',
      })
    );
  }

  const config = new DocumentBuilder()
    .setTitle('WebDev Studios API')
    .setVersion('1.0.0')
    .addBearerAuth(
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        name: 'Authorization',
        description: 'Enter JWT token',
        in: 'header',
      },
      'Bearer'
    )
    .addSecurityRequirements('Bearer')
    .addCookieAuth('access_token')
    .addCookieAuth('refresh_token')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  // Swagger UI available under the API global prefix: /v1/docs
  SwaggerModule.setup('v1/docs', app, document, {
    swaggerOptions: {
      persistAuthorization: true,
    },
    customSiteTitle: 'WebDev Studios API Documentation',
  });

  const port = configService.get<number>('PORT', 4000);
  await app.listen(port);
  console.log(`🚀 API server running on http://localhost:${port}/v1`);
  console.log(`📚 Swagger docs available at http://localhost:${port}/v1/docs`);
}

void bootstrap();
