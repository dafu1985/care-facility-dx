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
import { LoginDto } from './dto/login.dto';
import { LoginResponseDto } from './dto/login-response.dto';
import { JwtAuthGuard } from './jwt-auth.guard';
import type { AuthenticatedUser } from './jwt.strategy';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
  ) {}

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
    @Body() dto: LoginDto,
  ): Promise<LoginResponseDto> {
    return this.authService.login(dto);
  }

  @Get('me')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'ログインユーザー情報を取得する',
  })
  @ApiOkResponse({
    description: 'ログインユーザー情報の取得に成功',
  })
  @ApiUnauthorizedResponse({
    description: 'JWTが未指定または不正',
  })
  getMe(
    @CurrentUser()
    user: AuthenticatedUser,
  ): AuthenticatedUser {
    return user;
  }
}
