import {
  ArrayNotEmpty,
  IsArray,
  IsEnum,
  IsOptional,
  IsString,
  MaxLength,
  ValidateNested,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';

import { MedicalConditionCode } from '../../medical-conditions/entities/medical-condition-master.entity';
import { FacilityMedicalCapabilityStatus } from '../entities/facility-medical-capability.entity';

/**
 * 施設の医療対応能力1件分
 */
export class MedicalCapabilityItemDto {
  @ApiProperty({
    description: '医療条件コード',
    enum: MedicalConditionCode,
    example: MedicalConditionCode.GASTROSTOMY,
  })
  @IsEnum(MedicalConditionCode)
  code: MedicalConditionCode;

  @ApiProperty({
    description: '施設の対応可否',
    enum: FacilityMedicalCapabilityStatus,
    example: FacilityMedicalCapabilityStatus.AVAILABLE,
  })
  @IsEnum(FacilityMedicalCapabilityStatus)
  status: FacilityMedicalCapabilityStatus;

  @ApiPropertyOptional({
    description: '対応条件などの補足',
    example: '日中のみ対応可能',
  })
  @IsOptional()
  @IsString()
  @MaxLength(1000)
  note?: string;
}

/**
 * 施設に設定されている医療対応能力を全置換するDTO
 */
export class ReplaceMedicalCapabilitiesDto {
  @ApiProperty({
    description: '施設の医療対応能力一覧',
    type: [MedicalCapabilityItemDto],
  })
  @IsArray()
  @ArrayNotEmpty()
  @ValidateNested({ each: true })
  @Type(() => MedicalCapabilityItemDto)
  capabilities: MedicalCapabilityItemDto[];
}
