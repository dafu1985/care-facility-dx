import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';

import { UserRole } from '../users/entities/user.entity';

/**
 * JWTに格納するPayload。
 */
export interface JwtPayload {
  /**
   * ユーザーID。
   */
  sub: string;

  /**
   * ユーザー権限。
   */
  role: UserRole;

  /**
   * メールアドレス。
   */
  email: string;
}

/**
 * JwtAuthGuard通過後に
 * request.userとして利用するユーザー情報。
 */
export interface AuthenticatedUser {
  /**
   * ユーザーID。
   */
  userId: string;

  /**
   * ユーザー権限。
   */
  role: UserRole;

  /**
   * メールアドレス。
   */
  email: string;
}

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(configService: ConfigService) {
    super({
      /**
       * Authorization: Bearer xxx
       * からJWTを取得する。
       */
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),

      /**
       * 有効期限切れJWTを許可しない。
       */
      ignoreExpiration: false,

      /**
       * JWT署名検証用Secret。
       */
      secretOrKey: configService.getOrThrow<string>('JWT_SECRET'),
    });
  }

  /**
   * JWT検証成功後に実行される。
   *
   * 戻り値はrequest.userへ格納される。
   */
  validate(payload: JwtPayload): AuthenticatedUser {
    /**
     * subが存在しないJWTは不正として扱う。
     */
    if (!payload.sub) {
      throw new UnauthorizedException('Invalid token');
    }

    return {
      userId: payload.sub,
      role: payload.role,
      email: payload.email,
    };
  }
}
