import { Transform, Type } from 'class-transformer';
import {
  IsBoolean,
  IsEnum,
  IsInt,
  IsOptional,
  IsString,
  IsUUID,
  Max,
  Min,
} from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

import { AvailabilityStatus } from '../entities/facility-availability.entity';

export class FacilitySearchDto {
  @ApiPropertyOptional({
    description: '検索対象エリア',
    example: '新潟市中央区',
  })
  @IsOptional()
  @IsString()
  area?: string;

  @ApiPropertyOptional({
    description: '施設種別ID',
    format: 'uuid',
    example: 'f611d3fa-a0b6-49ef-857e-1b1c15c1248c',
  })
  @IsOptional()
  @IsUUID()
  facilityTypeId?: string;

  @ApiPropertyOptional({
    description: '空き状況',
    enum: AvailabilityStatus,
    example: AvailabilityStatus.AVAILABLE,
  })
  @IsOptional()
  @IsEnum(AvailabilityStatus)
  availability?: AvailabilityStatus;

  @ApiPropertyOptional({
    description: '月額料金の上限（円）',
    example: 150000,
    minimum: 0,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  maxMonthlyCost?: number;

  @ApiPropertyOptional({
    description: '要介護度',
    example: 3,
    minimum: 1,
    maximum: 5,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(5)
  careLevel?: number;

  @ApiPropertyOptional({
    description: '認知症対応の施設に限定するか',
    type: Boolean,
    example: true,
  })
  @IsOptional()
  @Transform(({ value }) => value === 'true')
  @IsBoolean()
  dementiaAccepted?: boolean;

  @ApiPropertyOptional({
    description: '医療ケア対応の施設に限定するか',
    type: Boolean,
    example: true,
  })
  @IsOptional()
  @Transform(({ value }) => value === 'true')
  @IsBoolean()
  medicalCareAccepted?: boolean;

  @ApiPropertyOptional({
    description: '車椅子対応の施設に限定するか',
    type: Boolean,
    example: true,
  })
  @IsOptional()
  @Transform(({ value }) => value === 'true')
  @IsBoolean()
  wheelchairAccepted?: boolean;

  @ApiPropertyOptional({
    description: '看取り対応の施設に限定するか',
    type: Boolean,
    example: true,
  })
  @IsOptional()
  @Transform(({ value }) => value === 'true')
  @IsBoolean()
  endOfLifeCare?: boolean;

  @ApiPropertyOptional({
    description: 'ページ番号',
    example: 1,
    default: 1,
    minimum: 1,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page: number = 1;

  @ApiPropertyOptional({
    description: '1ページあたりの取得件数',
    example: 20,
    default: 20,
    minimum: 1,
    maximum: 100,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  pageSize: number = 20;
}