import {
  IsBoolean,
  IsDateString,
  IsEnum,
  IsInt,
  IsOptional,
  IsString,
  MaxLength,
  Min,
} from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

import { ClientGender } from '../entities/client-condition.entity';

export class UpsertClientConditionDto {
  @ApiPropertyOptional({
    description: '年齢層',
    example: '80s',
    maxLength: 30,
  })
  @IsOptional()
  @IsString()
  @MaxLength(30)
  ageGroup?: string;

  @ApiPropertyOptional({
    description: '性別',
    enum: ClientGender,
    example: ClientGender.FEMALE,
  })
  @IsOptional()
  @IsEnum(ClientGender)
  gender?: ClientGender;

  @ApiPropertyOptional({
    description: '要介護度',
    example: 'CARE_3',
    maxLength: 30,
  })
  @IsOptional()
  @IsString()
  @MaxLength(30)
  careLevel?: string;

  @ApiPropertyOptional({
    description: '月額予算上限',
    example: 150000,
  })
  @IsOptional()
  @IsInt()
  @Min(0)
  budgetMax?: number;

  @ApiPropertyOptional({
    description: '希望地域',
    example: '新潟市中央区',
    maxLength: 255,
  })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  desiredArea?: string;

  @ApiPropertyOptional({
    description: '生活保護利用の有無',
    example: false,
  })
  @IsOptional()
  @IsBoolean()
  publicAssistance?: boolean;

  @ApiPropertyOptional({
    description: '身元保証人の有無',
    example: true,
  })
  @IsOptional()
  @IsBoolean()
  guarantorAvailable?: boolean;

  @ApiPropertyOptional({
    description: '認知症の有無',
    example: true,
  })
  @IsOptional()
  @IsBoolean()
  dementia?: boolean;

  @ApiPropertyOptional({
    description: '看取り対応を希望するか',
    example: false,
  })
  @IsOptional()
  @IsBoolean()
  endOfLifeCare?: boolean;

  @ApiPropertyOptional({
    description: '入居希望日',
    example: '2026-10-01',
  })
  @IsOptional()
  @IsDateString()
  desiredMoveInDate?: string;
}
