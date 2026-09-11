import {
  Body,
  Controller,
  Get,
  Param,
  Put,
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
import type { AuthenticatedUser } from '../auth/jwt.strategy';
import { Roles } from '../auth/roles.decorator';
import { RolesGuard } from '../auth/roles.guard';
import { UserRole } from '../users/entities/user.entity';

import { FacilitiesService } from './facilities.service';

import { FacilityAvailabilityResponseDto } from './dto/facility-availability-response.dto';
import { FacilityPricingResponseDto } from './dto/facility-pricing-response.dto';
import { FacilityRequirementResponseDto } from './dto/facility-requirement-response.dto';
import {
  FacilityListResponseDto,
  FacilityResponseDto,
} from './dto/facility-response.dto';
import { FacilitySearchDto } from './dto/facility-search.dto';
import { UpdateFacilityAvailabilityDto } from './dto/update-facility-availability.dto';
import { UpdateFacilityPricingDto } from './dto/update-facility-pricing.dto';
import { UpdateFacilityRequirementDto } from './dto/update-facility-requirement.dto';
import { UpdateFacilityDto } from './dto/update-facility.dto';
import { FacilityDashboardResponseDto } from './dto/facility-dashboard-response.dto';
import { ReplaceMedicalCapabilitiesDto } from './dto/replace-medical-capabilities.dto';

@ApiTags('facilities')
@Controller('facilities')
export class FacilitiesController {
  constructor(private readonly facilitiesService: FacilitiesService) {}

  /**
   * 施設側ダッシュボード取得。
   *
   * FACILITY:
   * 自施設のみ取得可能。
   *
   * ADMIN:
   * 任意施設取得可能。
   */
  @Get(':facilityId/dashboard')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.FACILITY, UserRole.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({
    summary: '施設側ダッシュボードを取得する',
    description:
      '施設職員は自施設、管理者は任意施設のダッシュボード情報を取得します。',
  })
  @ApiParam({
    name: 'facilityId',
    description: '施設ID',
    example: '5ea06a45-7587-4198-b94c-56e0044399c7',
  })
  @ApiOkResponse({
    description: '施設ダッシュボードの取得に成功',
    type: FacilityDashboardResponseDto,
  })
  @ApiBadRequestResponse({
    description: '施設IDの形式が不正',
  })
  @ApiUnauthorizedResponse({
    description: 'JWTが未指定または不正',
  })
  @ApiForbiddenResponse({
    description: 'この施設のダッシュボードを参照する権限がない',
  })
  @ApiNotFoundResponse({
    description: '指定された施設が存在しない',
  })
  async getDashboard(
    @Param('facilityId', new ParseUUIDPipe())
    facilityId: string,

    @CurrentUser()
    user: AuthenticatedUser,
  ): Promise<FacilityDashboardResponseDto> {
    return this.facilitiesService.getDashboard(facilityId, user);
  }

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
   * 施設基本情報更新。
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
  @Patch(':facilityId')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.FACILITY, UserRole.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({
    summary: '介護施設の基本情報を更新する',
    description: '施設職員は自施設、管理者は任意施設の基本情報を更新します。',
  })
  @ApiParam({
    name: 'facilityId',
    description: '施設ID',
    example: '5ea06a45-7587-4198-b94c-56e0044399c7',
  })
  @ApiOkResponse({
    description: '施設基本情報の更新に成功',
    type: FacilityResponseDto,
  })
  @ApiBadRequestResponse({
    description: '施設IDまたは入力値が不正',
  })
  @ApiUnauthorizedResponse({
    description: 'JWTが未指定または不正',
  })
  @ApiForbiddenResponse({
    description: 'この施設の基本情報を更新する権限がない',
  })
  @ApiNotFoundResponse({
    description: '指定された施設が存在しない',
  })
  async updateFacility(
    @Param('facilityId', new ParseUUIDPipe())
    facilityId: string,

    @Body()
    dto: UpdateFacilityDto,

    @CurrentUser()
    user: AuthenticatedUser,
  ): Promise<FacilityResponseDto> {
    return this.facilitiesService.updateFacility(facilityId, dto, user);
  }

  /**
   * 施設の空き状況更新。
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

  /**
   * 施設の受入条件更新。
   */
  @Patch(':facilityId/requirement')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.FACILITY, UserRole.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({
    summary: '介護施設の受入条件を更新する',
    description: '施設職員は自施設、管理者は任意施設の受入条件を更新します。',
  })
  @ApiParam({
    name: 'facilityId',
    description: '施設ID',
    example: '5ea06a45-7587-4198-b94c-56e0044399c7',
  })
  @ApiOkResponse({
    description: '受入条件の更新に成功',
    type: FacilityRequirementResponseDto,
  })
  @ApiBadRequestResponse({
    description: '施設ID、入力値、または要介護度の範囲が不正',
  })
  @ApiUnauthorizedResponse({
    description: 'JWTが未指定または不正',
  })
  @ApiForbiddenResponse({
    description: 'この施設の受入条件を更新する権限がない',
  })
  @ApiNotFoundResponse({
    description: '指定された施設が存在しない',
  })
  async updateRequirement(
    @Param('facilityId', new ParseUUIDPipe())
    facilityId: string,

    @Body()
    dto: UpdateFacilityRequirementDto,

    @CurrentUser()
    user: AuthenticatedUser,
  ): Promise<FacilityRequirementResponseDto> {
    return this.facilitiesService.updateRequirement(facilityId, dto, user);
  }

  /**
   * 施設の料金情報更新。
   */
  @Patch(':facilityId/pricing')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.FACILITY, UserRole.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({
    summary: '介護施設の料金情報を更新する',
    description: '施設職員は自施設、管理者は任意施設の料金情報を更新します。',
  })
  @ApiParam({
    name: 'facilityId',
    description: '施設ID',
    example: '5ea06a45-7587-4198-b94c-56e0044399c7',
  })
  @ApiOkResponse({
    description: '料金情報の更新に成功',
    type: FacilityPricingResponseDto,
  })
  @ApiBadRequestResponse({
    description: '施設ID、入力値、または料金範囲が不正',
  })
  @ApiUnauthorizedResponse({
    description: 'JWTが未指定または不正',
  })
  @ApiForbiddenResponse({
    description: 'この施設の料金情報を更新する権限がない',
  })
  @ApiNotFoundResponse({
    description: '指定された施設が存在しない',
  })
  async updatePricing(
    @Param('facilityId', new ParseUUIDPipe())
    facilityId: string,

    @Body()
    dto: UpdateFacilityPricingDto,

    @CurrentUser()
    user: AuthenticatedUser,
  ): Promise<FacilityPricingResponseDto> {
    return this.facilitiesService.updatePricing(facilityId, dto, user);
  }

  @Put(':facilityId/medical-capabilities')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.FACILITY, UserRole.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({
    summary: '施設の医療対応能力を登録・更新する',
    description:
      '施設職員は自施設、管理者は任意施設の医療対応能力を全置換します。',
  })
  @ApiParam({
    name: 'facilityId',
    description: '施設ID',
  })
  async replaceMedicalCapabilities(
    @Param('facilityId', new ParseUUIDPipe())
    facilityId: string,

    @Body()
    dto: ReplaceMedicalCapabilitiesDto,

    @CurrentUser()
    user: AuthenticatedUser,
  ) {
    return this.facilitiesService.replaceMedicalCapabilities(
      facilityId,
      dto,
      user,
    );
  }

  @Get(':facilityId/medical-capabilities')
  @ApiOperation({
    summary: '施設の医療対応能力を取得する',
    description:
      '施設に登録されている医療対応能力を医療条件マスタ情報とともに取得します。',
  })
  @ApiParam({
    name: 'facilityId',
    description: '施設ID',
  })
  async getMedicalCapabilities(
    @Param('facilityId', new ParseUUIDPipe())
    facilityId: string,
  ) {
    return this.facilitiesService.getMedicalCapabilities(facilityId);
  }
}
