import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import {
  DocumentBuilder,
  SwaggerModule,
} from '@nestjs/swagger';

import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.setGlobalPrefix('api/v1');

  app.enableCors({
    origin: 'http://localhost:5173',
  });

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: true,
    }),
  );

  const swaggerConfig = new DocumentBuilder()
    .setTitle('Care Facility DX API')
    .addBearerAuth()
    .setDescription(
      'ケアマネジャー向け介護施設検索・問い合わせDXシステム API',
    )
    .setVersion('1.0')
    .addTag('facilities', '介護施設検索・詳細')
    .addTag('inquiries', '問い合わせ管理')
    .build();

  const documentFactory = () =>
    SwaggerModule.createDocument(
      app,
      swaggerConfig,
    );

  SwaggerModule.setup(
    'api/docs',
    app,
    documentFactory,
  );

  await app.listen(
    process.env.PORT ?? 3000,
  );
}

bootstrap();