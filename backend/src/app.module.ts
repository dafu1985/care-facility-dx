import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';

import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UsersModule } from './modules/users/users.module';
import { CareManagersModule } from './modules/care-managers/care-managers.module';
import { FacilitiesModule } from './modules/facilities/facilities.module';
import { InquiriesModule } from './modules/inquiries/inquiries.module';
import { AuthModule } from './modules/auth/auth.module';
import { OrganizationsModule } from './modules/organizations/organizations.module';
import { CareManagerOfficesModule } from './modules/care-managers/care-manager-offices.module';
import { PlacementCasesModule } from './modules/placement-cases/placement-cases.module';
import { MedicalConditionsModule } from './modules/medical-conditions/medical-conditions.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),

    TypeOrmModule.forRootAsync({
      inject: [ConfigService],

      useFactory: (configService: ConfigService) => {
        /**
         * Vercel / NeonではDATABASE_URLを使用する。
         *
         * ローカル開発では従来どおり
         * DB_HOST等の個別設定も利用可能にする。
         */
        const databaseUrl = configService.get<string>('DATABASE_URL');

        if (databaseUrl) {
          return {
            type: 'postgres' as const,

            url: databaseUrl,

            /**
             * Neon接続ではSSLを使用する。
             */
            ssl: {
              rejectUnauthorized: false,
            },

            autoLoadEntities: true,

            /**
             * DBスキーマはMigrationで管理する。
             */
            synchronize: false,
          };
        }

        /**
         * ローカルDocker PostgreSQL用。
         */
        return {
          type: 'postgres' as const,

          host: configService.getOrThrow<string>('DB_HOST'),

          port: configService.getOrThrow<number>('DB_PORT'),

          username: configService.getOrThrow<string>('DB_USERNAME'),

          password: configService.getOrThrow<string>('DB_PASSWORD'),

          database: configService.getOrThrow<string>('DB_DATABASE'),

          autoLoadEntities: true,

          synchronize: false,
        };
      },
    }),
    UsersModule,
    CareManagersModule,
    FacilitiesModule,
    InquiriesModule,
    AuthModule,
    OrganizationsModule,
    CareManagerOfficesModule,
    PlacementCasesModule,
    MedicalConditionsModule,
  ],

  controllers: [AppController],

  providers: [AppService],
})
export class AppModule {}
