import { Injectable, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { JwtService } from '@nestjs/jwt';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';

import { LoginDto } from './dto/login.dto';
import { LoginResponseDto } from './dto/login-response.dto';
import { AuthMeResponseDto } from './dto/auth-me-response.dto';

import type { AuthenticatedUser } from './jwt.strategy';

import { User, UserRole, UserStatus } from '../users/entities/user.entity';

import {
  FacilityStaff,
  FacilityStaffStatus,
} from '../facilities/entities/facility-staff.entity';

@Injectable()
export class AuthService {
  constructor(
    /**
     * ユーザー情報取得用Repository。
     *
     * ログイン時のメールアドレス検索、
     * ステータス確認などに使用する。
     */
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,

    /**
     * FACILITYユーザーの所属施設取得用Repository。
     *
     * GET /auth/me で、
     * ログイン中の施設職員が所属している
     * facilityIdを取得するために使用する。
     */
    @InjectRepository(FacilityStaff)
    private readonly facilityStaffRepository: Repository<FacilityStaff>,

    /**
     * JWT発行用Service。
     */
    private readonly jwtService: JwtService,
  ) {}

  /**
   * ログイン。
   *
   * メールアドレスとパスワードを検証し、
   * 認証成功時にJWTを発行する。
   */
  async login(dto: LoginDto): Promise<LoginResponseDto> {
    /**
     * メールアドレスからユーザーを取得する。
     */
    const user = await this.userRepository.findOne({
      where: {
        email: dto.email,
      },
    });

    /**
     * ユーザーが存在しない、
     * またはパスワードが登録されていない場合は
     * 認証失敗。
     */
    if (!user || !user.passwordHash) {
      throw new UnauthorizedException('Invalid email or password');
    }

    /**
     * ACTIVEユーザーのみログイン可能。
     */
    if (user.status !== UserStatus.ACTIVE) {
      throw new UnauthorizedException('User is not active');
    }

    /**
     * 入力されたパスワードと
     * DBに保存されているHashを比較する。
     */
    const passwordMatched = await bcrypt.compare(
      dto.password,
      user.passwordHash,
    );

    if (!passwordMatched) {
      throw new UnauthorizedException('Invalid email or password');
    }

    /**
     * JWT Payload。
     */
    const payload = {
      sub: user.userId,
      role: user.role,
      email: user.email,
    };

    /**
     * JWTを発行する。
     */
    const accessToken = await this.jwtService.signAsync(payload);

    return {
      accessToken,
      userId: user.userId,
      role: user.role,
      email: user.email,
    };
  }

  /**
   * ログイン中のユーザー情報を取得する。
   *
   * FACILITY:
   * ACTIVE状態で所属している施設IDを返す。
   *
   * ADMIN / CARE_MANAGER:
   * facilityIdはnullを返す。
   */
  async getMe(user: AuthenticatedUser): Promise<AuthMeResponseDto> {
    /**
     * FACILITY以外は施設所属を取得しない。
     */
    if (user.role !== UserRole.FACILITY) {
      return {
        userId: user.userId,
        email: user.email,
        role: user.role,
        facilityId: null,
      };
    }

    /**
     * FACILITYユーザーがACTIVE状態で
     * 所属している施設を取得する。
     */
    const facilityStaff = await this.facilityStaffRepository.findOne({
      where: {
        userId: user.userId,
        status: FacilityStaffStatus.ACTIVE,
      },
    });

    return {
      userId: user.userId,
      email: user.email,
      role: user.role,
      facilityId: facilityStaff?.facilityId ?? null,
    };
  }
}
