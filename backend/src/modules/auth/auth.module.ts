import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { ConfigModule, ConfigService } from '@nestjs/config';

import { User } from '../users/entities/user.entity';
import { FacilityStaff } from '../facilities/entities/facility-staff.entity';

import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { JwtAuthGuard } from './jwt-auth.guard';
import { JwtStrategy } from './jwt.strategy';
import { RolesGuard } from './roles.guard';

@Module({
  imports: [
    /**
     * AuthServiceで使用するRepository。
     *
     * User:
     * ログインユーザーの取得に使用する。
     *
     * FacilityStaff:
     * FACILITYユーザーの所属施設取得に使用する。
     */
    TypeOrmModule.forFeature([User, FacilityStaff]),

    /**
     * Passportのデフォルト認証方式として
     * JWTを使用する。
     */
    PassportModule.register({
      defaultStrategy: 'jwt',
    }),

    /**
     * JWT発行設定。
     */
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        secret: configService.getOrThrow<string>('JWT_SECRET'),
        signOptions: {
          expiresIn: '1h',
        },
      }),
    }),
  ],

  controllers: [AuthController],

  providers: [AuthService, JwtStrategy, JwtAuthGuard, RolesGuard],

  exports: [PassportModule, JwtModule, AuthService, JwtAuthGuard, RolesGuard],
})
export class AuthModule {}
