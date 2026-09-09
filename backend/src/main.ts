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
   * 本番Frontend URL。
   *
   * Vercel側のEnvironment Variablesで
   * FRONTEND_URLを設定する。
   */
  const frontendUrl = process.env.FRONTEND_URL;

  /**
   * FrontendからのAPIアクセスを許可する。
   *
   * 許可対象:
   * - ローカルFrontend
   * - FRONTEND_URLで指定した本番Frontend
   * - Care Facility DXのVercel Preview URL
   */
  app.enableCors({
    origin: (
      origin: string | undefined,
      callback: (error: Error | null, allow?: boolean) => void,
    ) => {
      /**
       * Originが無い通信。
       */
      if (!origin) {
        callback(null, true);
        return;
      }

      /**
       * ローカル開発環境。
       */
      if (origin === 'http://localhost:5173') {
        callback(null, true);
        return;
      }

      /**
       * FRONTEND_URLで指定したFrontend。
       */
      if (frontendUrl && origin === frontendUrl) {
        callback(null, true);
        return;
      }

      /**
       * Vercel Preview Deployment。
       */
      const isVercelPreview =
        /^https:\/\/care-facility-dx-ayb7-[a-zA-Z0-9-]+-farmsearchnave-projects\.vercel\.app$/.test(
          origin,
        );

      if (isVercelPreview) {
        callback(null, true);
        return;
      }

      /**
       * 許可対象外。
       */
      callback(new Error(`CORS blocked: ${origin}`), false);
    },

    methods: ['GET', 'POST', 'PATCH', 'PUT', 'DELETE', 'OPTIONS'],

    allowedHeaders: ['Content-Type', 'Authorization'],
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
