import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';

import { AuthService } from './auth.service';
import { CurrentUser } from './current-user.decorator';
import { AuthMeResponseDto } from './dto/auth-me-response.dto';
import { LoginDto } from './dto/login.dto';
import { LoginResponseDto } from './dto/login-response.dto';
import { JwtAuthGuard } from './jwt-auth.guard';
import type { AuthenticatedUser } from './jwt.strategy';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  /**
   * ログイン。
   *
   * メールアドレスとパスワードを検証し、
   * JWTアクセストークンを発行する。
   */
  @Post('login')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'ログインする',
    description:
      'メールアドレスとパスワードを検証し、JWTアクセストークンを発行します。',
  })
  @ApiOkResponse({
    description: 'ログイン成功',
    type: LoginResponseDto,
  })
  @ApiUnauthorizedResponse({
    description:
      'メールアドレスまたはパスワードが不正、またはユーザーが利用不可',
  })
  async login(
    @Body()
    dto: LoginDto,
  ): Promise<LoginResponseDto> {
    return this.authService.login(dto);
  }

  /**
   * ログイン中のユーザー情報を取得する。
   *
   * FACILITYユーザーの場合は、
   * ACTIVE状態で所属している施設IDも返却する。
   */
  @Get('me')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'ログインユーザー情報を取得する',
    description:
      'JWTからログインユーザーを特定し、FACILITYユーザーの場合は所属施設IDも返却します。',
  })
  @ApiOkResponse({
    description: 'ログインユーザー情報の取得に成功',
    type: AuthMeResponseDto,
  })
  @ApiUnauthorizedResponse({
    description: 'JWTが未指定または不正',
  })
  async getMe(
    @CurrentUser()
    user: AuthenticatedUser,
  ): Promise<AuthMeResponseDto> {
    return this.authService.getMe(user);
  }
}
