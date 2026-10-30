import {
  Body,
  Controller,
  Get,
  Param,
  ParseUUIDPipe,
  Patch,
  UseGuards,
} from '@nestjs/common';

import {
  ApiBearerAuth,
  ApiForbiddenResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';

import { AdminService } from './admin.service';
import { UpdateFacilityStatusDto } from './dto/update-facility-status.dto';

import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { UserRole } from '../users/entities/user.entity';

import {
  FacilityListResponseDto,
  FacilityResponseDto,
} from '../facilities/dto/facility-response.dto';

@ApiTags('admin')
@ApiBearerAuth()
@Controller('admin')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.ADMIN)
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  /**
   * 管理者ダッシュボード。
   */
  @Get('dashboard')
  @ApiOperation({
    summary: '管理者ダッシュボードを取得する',
  })
  getDashboard() {
    return this.adminService.getDashboard();
  }

  /**
   * 管理者向け施設一覧。
   */
  @Get('facilities')
  @ApiOperation({
    summary: '管理者向け施設一覧を取得する',
    description: 'ACTIVE・INACTIVEを含む全施設を取得します。',
  })
  @ApiOkResponse({
    description: '施設一覧の取得に成功',
    type: FacilityListResponseDto,
  })
  @ApiUnauthorizedResponse({
    description: 'JWTが未指定または不正',
  })
  @ApiForbiddenResponse({
    description: 'ADMIN権限がない',
  })
  getFacilities(): Promise<FacilityListResponseDto> {
    return this.adminService.getFacilities();
  }

  /**
   * 管理者向け施設詳細。
   */
  @Get('facilities/:facilityId')
  @ApiOperation({
    summary: '管理者向け施設詳細を取得する',
    description: 'ACTIVE・INACTIVEを含む施設の詳細情報を取得します。',
  })
  @ApiParam({
    name: 'facilityId',
    description: '施設ID（UUID）',
  })
  @ApiOkResponse({
    description: '施設詳細の取得に成功',
    type: FacilityResponseDto,
  })
  @ApiUnauthorizedResponse({
    description: 'JWTが未指定または不正',
  })
  @ApiForbiddenResponse({
    description: 'ADMIN権限がない',
  })
  @ApiNotFoundResponse({
    description: '指定された施設が存在しない',
  })
  getFacility(
    @Param('facilityId', new ParseUUIDPipe())
    facilityId: string,
  ): Promise<FacilityResponseDto> {
    return this.adminService.getFacility(facilityId);
  }

  /**
   * 管理者による施設の利用停止・再開。
   */
  @Patch('facilities/:facilityId/status')
  @ApiOperation({
    summary: '施設の利用ステータスを変更する',
    description: 'ADMINが施設をACTIVEまたはINACTIVEに変更します。',
  })
  @ApiParam({
    name: 'facilityId',
    description: '施設ID（UUID）',
  })
  @ApiOkResponse({
    description: '施設ステータスの変更に成功',
    type: FacilityResponseDto,
  })
  @ApiUnauthorizedResponse({
    description: 'JWTが未指定または不正',
  })
  @ApiForbiddenResponse({
    description: 'ADMIN権限がない',
  })
  @ApiNotFoundResponse({
    description: '指定された施設が存在しない',
  })
  updateFacilityStatus(
    @Param('facilityId', new ParseUUIDPipe())
    facilityId: string,
    @Body() dto: UpdateFacilityStatusDto,
  ): Promise<FacilityResponseDto> {
    return this.adminService.updateFacilityStatus(facilityId, dto);
  }
}
