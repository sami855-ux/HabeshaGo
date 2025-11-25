import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import * as bodyParser from 'body-parser';
import { auth } from '../lib/better-auth';
import cors from 'cors';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    bodyParser: false, // required for BetterAuth
  });

  // Manually add JSON body parser for non-BetterAuth routes
  app.use(bodyParser.json());

  app.enableCors({
    origin: 'http://localhost:3000',
    credentials: true,
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    allowedHeaders: [
      'Content-Type',
      'Authorization',
      'X-Requested-With',
      'Accept',
      'Origin',
    ],
    exposedHeaders: ['Set-Cookie'],
    optionsSuccessStatus: 200, // Important for some browsers // allow all headers
  });

  // CRITICAL: Apply CORS specifically to Better-Auth routes BEFORE mounting the handler
  app.use(
    '/api/auth',
    cors({
      origin: ['http://localhost:3000'], // Adjust for prod
      methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
      allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
      credentials: true,
      optionsSuccessStatus: 200, // Some legacy browsers choke on 204
    }),
    auth.handler,
  );

  app.useGlobalPipes(new ValidationPipe());

  const port = process.env.PORT ? +process.env.PORT : 3001;
  await app.listen(port);
  console.log(`Server running on http://localhost:${port}`);
}

bootstrap();
