import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import * as bodyParser from 'body-parser';
import { auth } from '../lib/better-auth';
import cors from 'cors';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    bodyParser: false,
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
      'User-Agent', // explicitly allow this
    ],
    exposedHeaders: ['Set-Cookie'],
    optionsSuccessStatus: 200,
  });

  app.setGlobalPrefix('api');
  app.useGlobalPipes(new ValidationPipe());

  const port = process.env.PORT ? +process.env.PORT : 3001;
  await app.listen(port);
  console.log(`Server running on http://localhost:${port}`);
}

bootstrap();
