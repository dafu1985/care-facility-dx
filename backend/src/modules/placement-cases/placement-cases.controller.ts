import {
  Body,
  Controller,
  Get,
  Param,
  Put,
  Post,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiCreatedResponse,
  ApiForbiddenResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';

import { CurrentUser } from '../auth/current-user.decorator';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import type { AuthenticatedUser } from '../auth/jwt.strategy';
import { Roles } from '../auth/roles.decorator';
import { RolesGuard } from '../auth/roles.guard';
import { UserRole } from '../users/entities/user.entity';

import { CreatePlacementCaseDto } from './dto/create-placement-case.dto';
import { PlacementCase } from './entities/placement-case.entity';
import { PlacementCasesService } from './placement-cases.service';
import { UpsertClientConditionDto } from './dto/upsert-client-condition.dto';
import { ReplaceMedicalRequirementsDto } from './dto/replace-medical-requirements.dto';

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
    @Body() dto: CreatePlacementCaseDto,
    @CurrentUser()
    user: AuthenticatedUser,
  ): Promise<PlacementCase> {
    return this.placementCasesService.create(dto, user);
  }

  @Get()
  @Roles(UserRole.CARE_MANAGER)
  @ApiOperation({
    summary: '施設探し案件一覧を取得する',
    description: 'ログイン中のケアマネジャー自身の施設探し案件を取得します。',
  })
  async findAll(
    @CurrentUser() user: AuthenticatedUser,
  ): Promise<PlacementCase[]> {
    return this.placementCasesService.findAll(user);
  }

  @Get(':id')
  @Roles(UserRole.CARE_MANAGER)
  @ApiOperation({
    summary: '施設探し案件の詳細を取得する',
    description:
      'ログイン中のケアマネジャー自身の施設探し案件を1件取得します。',
  })
  async findOne(
    @Param('id') id: string,
    @CurrentUser() user: AuthenticatedUser,
  ): Promise<PlacementCase> {
    return this.placementCasesService.findOne(id, user);
  }

  @Put(':id/medical-requirements')
  @Roles(UserRole.CARE_MANAGER)
  @ApiOperation({
    summary: '案件の医療条件を登録・更新する',
    description:
      'ログイン中のケアマネジャー自身の案件に紐づく医療条件を全置換します。',
  })
  async replaceMedicalRequirements(
    @Param('id') id: string,
    @Body() dto: ReplaceMedicalRequirementsDto,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.placementCasesService.replaceMedicalRequirements(id, dto, user);
  }
  async upsertClientCondition(
    @Param('id') id: string,
    @Body() dto: UpsertClientConditionDto,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.placementCasesService.upsertClientCondition(id, dto, user);
  }

  @Get(':id/conditions')
  @Roles(UserRole.CARE_MANAGER)
  @ApiOperation({
    summary: '利用者条件を取得する',
    description:
      'ログイン中のケアマネジャー自身の施設探し案件に紐づく利用者条件を取得します。',
  })
  async getClientCondition(
    @Param('id') id: string,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.placementCasesService.getClientCondition(id, user);
  }

  @Get(':id/medical-requirements')
  @Roles(UserRole.CARE_MANAGER)
  @ApiOperation({
    summary: '案件の医療条件を取得する',
    description:
      'ログイン中のケアマネジャー自身の案件に紐づく医療条件を取得します。',
  })
  async getMedicalRequirements(
    @Param('id') id: string,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.placementCasesService.getMedicalRequirements(id, user);
  }
}
