import { Type } from 'class-transformer';
import {
  IsEnum,
  IsInt,
  IsOptional,
  IsUUID,
  Max,
  Min,
} from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

import { InquiryStatus } from '../entities/inquiry.entity';

export class InquirySearchDto {
  @ApiPropertyOptional({
    description: '問い合わせ作成ユーザーID',
    example: '01541a48-ac15-4279-ac45-166b923f14c9',
  })
  @IsOptional()
  @IsUUID()
  createdByUserId?: string;

  @ApiPropertyOptional({
    description: '施設ID',
    example: '5ea06a45-7587-4198-b94c-56e0044399c7',
  })
  @IsOptional()
  @IsUUID()
  facilityId?: string;

  @ApiPropertyOptional({
    description: '問い合わせステータス',
    enum: InquiryStatus,
    example: InquiryStatus.OPEN,
  })
  @IsOptional()
  @IsEnum(InquiryStatus)
  status?: InquiryStatus;

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