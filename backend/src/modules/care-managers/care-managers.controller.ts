import { Controller, Get, UseGuards } from '@nestjs/common';

import {
  ApiBearerAuth,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';

import { CurrentUser } from '../auth/current-user.decorator';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { Roles } from '../auth/roles.decorator';
import { RolesGuard } from '../auth/roles.guard';

import type { AuthenticatedUser } from '../auth/jwt.strategy';

import { UserRole } from '../users/entities/user.entity';

import { CareManagersService } from './care-managers.service';

import type { CareManagerDashboardResponse } from './dto/care-manager-dashboard-response.dto';

@ApiTags('care-managers')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('care-managers')
export class CareManagersController {
  constructor(private readonly careManagersService: CareManagersService) {}

  /**
   * ケアマネジャーダッシュボード取得。
   */
  @Get('dashboard')
  @Roles(UserRole.CARE_MANAGER, UserRole.ADMIN)
  @ApiOperation({
    summary: 'ケアマネジャーダッシュボードを取得する',
    description:
      'ログイン中のケアマネジャー情報と問い合わせ件数、最近の問い合わせを取得します。',
  })
  @ApiOkResponse({
    description: 'ケアマネジャーダッシュボードの取得に成功',
  })
  @ApiNotFoundResponse({
    description: 'ログインユーザーに紐付くケアマネジャー情報が存在しない',
  })
  async getDashboard(
    @CurrentUser()
    user: AuthenticatedUser,
  ): Promise<CareManagerDashboardResponse> {
    return this.careManagersService.getDashboard(user.userId);
  }
}
