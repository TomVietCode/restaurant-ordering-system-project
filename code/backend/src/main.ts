import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import cookieParser from 'cookie-parser';
import { AppModule } from './app.module.js';
import { HttpExceptionFilter } from '@common/filters/http-exception.filter.js';


async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.use(cookieParser());

  app.setGlobalPrefix('api');

  // Enable CORS
  app.enableCors({
    origin: process.env.CORS_ORIGIN ?? 'http://localhost:3001',
    credentials: true,
  });

  // Global validation pipe
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  // Global exception filter
  app.useGlobalFilters(new HttpExceptionFilter());

  // Configure Swagger API metadata and parameters
  const config = new DocumentBuilder()
    .setTitle('Restaurant Ordering System API')
    .setDescription(
      'Backend API specifications and test panel for the F&B ordering system.',
    )
    .setVersion('1.0')
    .addBearerAuth(
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        name: 'JWT',
        description: 'Enter your JWT access token to access secured routes',
        in: 'header',
      },
      'JWT-auth', // Key identifier for @ApiBearerAuth('JWT-auth') decorator link
    )
    .build();

  // Instantiate the Swagger document factory
  const documentFactory = () => SwaggerModule.createDocument(app, config);

  // Serve Swagger UI documentation at /api/docs
  SwaggerModule.setup('/api/docs', app, documentFactory);

  await app.listen(process.env.PORT ?? 3000, '0.0.0.0');
}

bootstrap();
