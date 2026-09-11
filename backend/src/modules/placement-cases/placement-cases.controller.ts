import {
  Body,
  Controller,
  Get,
  Param,
  ParseUUIDPipe,
  Post,
  Put,
  UseGuards,
} from '@nestjs/common';

import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiCreatedResponse,
  ApiForbiddenResponse,
  ApiOperation,
  ApiParam,
  ApiTags,
} from '@nestjs/swagger';

import { CurrentUser } from '../auth/current-user.decorator';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import type { AuthenticatedUser } from '../auth/jwt.strategy';
import { Roles } from '../auth/roles.decorator';
import { RolesGuard } from '../auth/roles.guard';
import { UserRole } from '../users/entities/user.entity';

import { CreatePlacementCaseDto } from './dto/create-placement-case.dto';
import { ReplaceMedicalRequirementsDto } from './dto/replace-medical-requirements.dto';
import { UpsertClientConditionDto } from './dto/upsert-client-condition.dto';

import { PlacementCase } from './entities/placement-case.entity';

import { PlacementCasesService } from './placement-cases.service';

@ApiTags('placement-cases')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('placement-cases')
export class PlacementCasesController {
  constructor(private readonly placementCasesService: PlacementCasesService) {}

  /**
   * 施設探し案件を作成する。
   */
  @Post()
  @Roles(UserRole.CARE_MANAGER)
  @ApiOperation({
    summary: '施設探し案件を作成する',
    description: 'ログイン中のケアマネジャーに紐づく施設探し案件を作成します。',
  })
  @ApiCreatedResponse({
    description: '施設探し案件の作成に成功',
    type: PlacementCase,
  })
  @ApiBadRequestResponse({
    description: '入力値が不正',
  })
  @ApiForbiddenResponse({
    description: '施設探し案件を作成する権限がない',
  })
  async create(
    @Body()
    dto: CreatePlacementCaseDto,
    @CurrentUser()
    user: AuthenticatedUser,
  ): Promise<PlacementCase> {
    return this.placementCasesService.create(dto, user);
  }

  /**
   * ログイン中のケアマネジャー自身の案件一覧を取得する。
   */
  @Get()
  @Roles(UserRole.CARE_MANAGER)
  @ApiOperation({
    summary: '施設探し案件一覧を取得する',
    description: 'ログイン中のケアマネジャー自身の施設探し案件を取得します。',
  })
  async findAll(
    @CurrentUser()
    user: AuthenticatedUser,
  ): Promise<PlacementCase[]> {
    return this.placementCasesService.findAll(user);
  }

  /**
   * 施設探し案件の詳細を取得する。
   */
  @Get(':id')
  @Roles(UserRole.CARE_MANAGER)
  @ApiOperation({
    summary: '施設探し案件の詳細を取得する',
    description:
      'ログイン中のケアマネジャー自身の施設探し案件を1件取得します。',
  })
  @ApiParam({
    name: 'id',
    description: '施設探し案件ID',
  })
  async findOne(
    @Param('id', new ParseUUIDPipe())
    id: string,
    @CurrentUser()
    user: AuthenticatedUser,
  ): Promise<PlacementCase> {
    return this.placementCasesService.findOne(id, user);
  }

  /**
   * 利用者条件を登録・更新する。
   */
  @Put(':id/conditions')
  @Roles(UserRole.CARE_MANAGER)
  @ApiOperation({
    summary: '利用者条件を登録・更新する',
    description:
      'ログイン中のケアマネジャー自身の施設探し案件に紐づく利用者条件を登録・更新します。',
  })
  @ApiParam({
    name: 'id',
    description: '施設探し案件ID',
  })
  async upsertClientCondition(
    @Param('id', new ParseUUIDPipe())
    id: string,
    @Body()
    dto: UpsertClientConditionDto,
    @CurrentUser()
    user: AuthenticatedUser,
  ) {
    return this.placementCasesService.upsertClientCondition(id, dto, user);
  }

  /**
   * 利用者条件を取得する。
   */
  @Get(':id/conditions')
  @Roles(UserRole.CARE_MANAGER)
  @ApiOperation({
    summary: '利用者条件を取得する',
    description:
      'ログイン中のケアマネジャー自身の施設探し案件に紐づく利用者条件を取得します。',
  })
  @ApiParam({
    name: 'id',
    description: '施設探し案件ID',
  })
  async getClientCondition(
    @Param('id', new ParseUUIDPipe())
    id: string,
    @CurrentUser()
    user: AuthenticatedUser,
  ) {
    return this.placementCasesService.getClientCondition(id, user);
  }

  /**
   * 案件の医療条件を登録・更新する。
   */
  @Put(':id/medical-requirements')
  @Roles(UserRole.CARE_MANAGER)
  @ApiOperation({
    summary: '案件の医療条件を登録・更新する',
    description:
      'ログイン中のケアマネジャー自身の案件に紐づく医療条件を全置換します。',
  })
  @ApiParam({
    name: 'id',
    description: '施設探し案件ID',
  })
  async replaceMedicalRequirements(
    @Param('id', new ParseUUIDPipe())
    id: string,
    @Body()
    dto: ReplaceMedicalRequirementsDto,
    @CurrentUser()
    user: AuthenticatedUser,
  ) {
    return this.placementCasesService.replaceMedicalRequirements(id, dto, user);
  }

  /**
   * 案件の医療条件を取得する。
   */
  @Get(':id/medical-requirements')
  @Roles(UserRole.CARE_MANAGER)
  @ApiOperation({
    summary: '案件の医療条件を取得する',
    description:
      'ログイン中のケアマネジャー自身の案件に紐づく医療条件を取得します。',
  })
  @ApiParam({
    name: 'id',
    description: '施設探し案件ID',
  })
  async getMedicalRequirements(
    @Param('id', new ParseUUIDPipe())
    id: string,
    @CurrentUser()
    user: AuthenticatedUser,
  ) {
    return this.placementCasesService.getMedicalRequirements(id, user);
  }

  /**
   * 施設マッチングを実行する。
   */
  @Post(':id/matching')
  @Roles(UserRole.CARE_MANAGER)
  @ApiOperation({
    summary: '案件の施設マッチングを実行する',
    description:
      '案件の医療条件と施設の医療対応能力を比較し、候補施設を生成します。',
  })
  @ApiParam({
    name: 'id',
    description: '施設探し案件ID',
  })
  async runMatching(
    @Param('id', new ParseUUIDPipe())
    placementCaseId: string,
    @CurrentUser()
    user: AuthenticatedUser,
  ) {
    return this.placementCasesService.runMatching(placementCaseId, user);
  }

  @Get(':id/candidates')
  @Roles(UserRole.CARE_MANAGER)
  @ApiOperation({
    summary: '案件の候補施設一覧を取得する',
    description:
      'マッチングによって生成された候補施設を、スコアの高い順に取得します。',
  })
  @ApiParam({
    name: 'id',
    description: '施設探し案件ID',
  })
  async getCandidateFacilities(
    @Param('id', new ParseUUIDPipe())
    placementCaseId: string,
    @CurrentUser()
    user: AuthenticatedUser,
  ) {
    return this.placementCasesService.getCandidateFacilities(
      placementCaseId,
      user,
    );
  }
}
