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
import { MedicalRequirementLevel } from '../entities/case-medical-requirement.entity';

export class MedicalRequirementItemDto {
  @ApiProperty({
    description: '医療条件コード',
    enum: MedicalConditionCode,
    example: MedicalConditionCode.GASTROSTOMY,
  })
  @IsEnum(MedicalConditionCode)
  code: MedicalConditionCode;

  @ApiProperty({
    description: '医療条件の重要度',
    enum: MedicalRequirementLevel,
    example: MedicalRequirementLevel.REQUIRED,
  })
  @IsEnum(MedicalRequirementLevel)
  requirementLevel: MedicalRequirementLevel;

  @ApiPropertyOptional({
    description: '補足メモ',
    example: '1日3回対応が必要',
  })
  @IsOptional()
  @IsString()
  @MaxLength(1000)
  note?: string;
}

export class ReplaceMedicalRequirementsDto {
  @ApiProperty({
    description: '案件に紐づく医療条件一覧',
    type: [MedicalRequirementItemDto],
  })
  @IsArray()
  @ArrayNotEmpty()
  @ValidateNested({ each: true })
  @Type(() => MedicalRequirementItemDto)
  requirements: MedicalRequirementItemDto[];
}
