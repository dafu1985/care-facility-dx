import {
  Body,
  Controller,
  Get,
  Param,
  ParseUUIDPipe,
  Patch,
  Query,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiForbiddenResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';

import { CurrentUser } from '../auth/current-user.decorator';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { Roles } from '../auth/roles.decorator';
import { RolesGuard } from '../auth/roles.guard';
import type { AuthenticatedUser } from '../auth/jwt.strategy';
import { UserRole } from '../users/entities/user.entity';

import { FacilitiesService } from './facilities.service';
import { FacilitySearchDto } from './dto/facility-search.dto';
import {
  FacilityListResponseDto,
  FacilityResponseDto,
} from './dto/facility-response.dto';
import { UpdateFacilityAvailabilityDto } from './dto/update-facility-availability.dto';
import { FacilityAvailabilityResponseDto } from './dto/facility-availability-response.dto';

@ApiTags('facilities')
@Controller('facilities')
export class FacilitiesController {
  constructor(private readonly facilitiesService: FacilitiesService) {}

  /**
   * 介護施設一覧検索。
   *
   * 現時点では公開検索APIとして扱うため、
   * JWT認証は付けない。
   */
  @Get()
  @ApiOperation({
    summary: '介護施設一覧を検索する',
    description:
      'エリア、施設種別、空き状況、料金、要介護度、認知症対応などの条件で介護施設を検索します。',
  })
  @ApiOkResponse({
    description: '施設一覧の取得に成功',
    type: FacilityListResponseDto,
  })
  @ApiBadRequestResponse({
    description: '検索条件が不正',
  })
  async findAll(
    @Query()
    query: FacilitySearchDto,
  ): Promise<FacilityListResponseDto> {
    return this.facilitiesService.findAll(query);
  }

  /**
   * 介護施設詳細取得。
   *
   * 現時点では公開参照APIとして扱う。
   */
  @Get(':facilityId')
  @ApiOperation({
    summary: '介護施設の詳細を取得する',
    description:
      '指定された施設IDの基本情報、空き状況、料金、受入条件を取得します。',
  })
  @ApiParam({
    name: 'facilityId',
    description: '施設ID',
    example: '5ea06a45-7587-4198-b94c-56e0044399c7',
  })
  @ApiOkResponse({
    description: '施設詳細の取得に成功',
    type: FacilityResponseDto,
  })
  @ApiBadRequestResponse({
    description: '施設IDの形式が不正',
  })
  @ApiNotFoundResponse({
    description: '指定された施設が存在しない',
  })
  async findOne(
    @Param('facilityId', new ParseUUIDPipe())
    facilityId: string,
  ): Promise<FacilityResponseDto> {
    return this.facilitiesService.findOne(facilityId);
  }

  /**
   * 施設の空き状況更新。
   *
   * FACILITY:
   * 自分がACTIVE状態で所属している施設のみ更新可能。
   *
   * ADMIN:
   * 全施設更新可能。
   *
   * CARE_MANAGER:
   * RolesGuardで拒否。
   */
  @Patch(':facilityId/availability')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.FACILITY, UserRole.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({
    summary: '介護施設の空き状況を更新する',
    description: '施設職員は自施設、管理者は任意施設の空き状況を更新します。',
  })
  @ApiParam({
    name: 'facilityId',
    description: '施設ID',
    example: '5ea06a45-7587-4198-b94c-56e0044399c7',
  })
  @ApiOkResponse({
    description: '空き状況の更新に成功',
    type: FacilityAvailabilityResponseDto,
  })
  @ApiBadRequestResponse({
    description: '施設IDまたは入力値が不正',
  })
  @ApiUnauthorizedResponse({
    description: 'JWTが未指定または不正',
  })
  @ApiForbiddenResponse({
    description: 'この施設の空き状況を更新する権限がない',
  })
  @ApiNotFoundResponse({
    description: '指定された施設が存在しない',
  })
  async updateAvailability(
    @Param('facilityId', new ParseUUIDPipe())
    facilityId: string,

    @Body()
    dto: UpdateFacilityAvailabilityDto,

    @CurrentUser()
    user: AuthenticatedUser,
  ): Promise<FacilityAvailabilityResponseDto> {
    return this.facilitiesService.updateAvailability(facilityId, dto, user);
  }
}
