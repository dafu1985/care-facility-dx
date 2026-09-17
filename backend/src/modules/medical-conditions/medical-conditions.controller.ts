import { Controller, Get, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';

import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { MedicalConditionsService } from './medical-conditions.service';

/**
 * 医療条件マスタAPI。
 */
@ApiTags('medical-conditions')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('medical-conditions')
export class MedicalConditionsController {
  constructor(
    private readonly medicalConditionsService: MedicalConditionsService,
  ) {}

  /**
   * 利用可能な医療条件マスタ一覧を取得する。
   */
  @Get()
  @ApiOperation({
    summary: '利用可能な医療条件マスタ一覧を取得する',
  })
  findAll() {
    return this.medicalConditionsService.findAllActive();
  }
}