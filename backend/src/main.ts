import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  /**
   * API共通Prefix。
   */
  app.setGlobalPrefix('api/v1');

  /**
   * Frontendからのアクセスを許可する。
   *
   * ローカル:
   * http://localhost:5173
   *
   * Vercel:
   * FRONTEND_URLで指定する。
   */
  const frontendUrl = process.env.FRONTEND_URL ?? 'http://localhost:5173';

  /**
   * フロントエンドからのAPIアクセスを許可する。
   *
   * ローカル開発:
   * http://localhost:5173
   *
   * 本番:
   * FRONTEND_URL にVercelのFrontend URLを設定する。
   */
  app.enableCors({
    origin: process.env.FRONTEND_URL ?? 'http://localhost:5173',
  });

  /**
   * DTO Validation。
   */
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: true,
    }),
  );

  /**
   * Swagger設定。
   */
  const swaggerConfig = new DocumentBuilder()
    .setTitle('Care Facility DX API')
    .setDescription('ケアマネジャー向け介護施設検索・問い合わせDXシステム API')
    .setVersion('1.0')
    .addBearerAuth()
    .addTag('facilities', '介護施設検索・施設情報')
    .addTag('inquiries', '問い合わせ管理')
    .build();

  const documentFactory = () =>
    SwaggerModule.createDocument(app, swaggerConfig);

  SwaggerModule.setup('api/docs', app, documentFactory);

  /**
   * ローカル・Vercel共通。
   */
  await app.listen(process.env.PORT ?? 3000);
}

void bootstrap();
