import {
  IsDateString,
  IsEnum,
  IsInt,
  IsOptional,
  IsString,
  MaxLength,
  Min,
} from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

import { AvailabilityStatus } from '../entities/facility-availability.entity';

export class UpdateFacilityAvailabilityDto {
  @ApiPropertyOptional({
    description: '空き状況',
    enum: AvailabilityStatus,
    example: AvailabilityStatus.AVAILABLE,
  })
  @IsOptional()
  @IsEnum(AvailabilityStatus)
  status?: AvailabilityStatus;

  @ApiPropertyOptional({
    description: '受け入れ可能人数',
    example: 2,
    nullable: true,
  })
  @IsOptional()
  @IsInt()
  @Min(0)
  availableCount?: number | null;

  @ApiPropertyOptional({
    description: '男性向け空床数',
    example: 1,
    nullable: true,
  })
  @IsOptional()
  @IsInt()
  @Min(0)
  maleVacancy?: number | null;

  @ApiPropertyOptional({
    description: '女性向け空床数',
    example: 1,
    nullable: true,
  })
  @IsOptional()
  @IsInt()
  @Min(0)
  femaleVacancy?: number | null;

  @ApiPropertyOptional({
    description: '個室の空床数',
    example: 1,
    nullable: true,
  })
  @IsOptional()
  @IsInt()
  @Min(0)
  privateRoomVacancy?: number | null;

  @ApiPropertyOptional({
    description: '受け入れ可能日',
    example: '2026-09-15',
    nullable: true,
  })
  @IsOptional()
  @IsDateString()
  availableFrom?: string | null;

  @ApiPropertyOptional({
    description: '空き状況に関する補足',
    example: '現在2床空きあり。来週から受け入れ可能です。',
    nullable: true,
    maxLength: 2000,
  })
  @IsOptional()
  @IsString()
  @MaxLength(2000)
  note?: string | null;
}
