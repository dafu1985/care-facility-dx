import {
  IsBoolean,
  IsInt,
  IsOptional,
  IsString,
  Max,
  MaxLength,
  Min,
} from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateFacilityRequirementDto {
  @ApiPropertyOptional({
    description: '受け入れ可能な最低要介護度',
    example: 1,
    nullable: true,
  })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(5)
  minCareLevel?: number | null;

  @ApiPropertyOptional({
    description: '受け入れ可能な最高要介護度',
    example: 5,
    nullable: true,
  })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(5)
  maxCareLevel?: number | null;

  @ApiPropertyOptional({
    description: '認知症受け入れ可否',
    example: true,
  })
  @IsOptional()
  @IsBoolean()
  dementiaAccepted?: boolean;

  @ApiPropertyOptional({
    description: '医療ケア受け入れ可否',
    example: true,
  })
  @IsOptional()
  @IsBoolean()
  medicalCareAccepted?: boolean;

  @ApiPropertyOptional({
    description: '車椅子受け入れ可否',
    example: true,
  })
  @IsOptional()
  @IsBoolean()
  wheelchairAccepted?: boolean;

  @ApiPropertyOptional({
    description: '看取り対応可否',
    example: false,
  })
  @IsOptional()
  @IsBoolean()
  endOfLifeCare?: boolean;

  @ApiPropertyOptional({
    description: '受入条件に関する補足',
    example: '要介護3以上は事前面談が必要です。',
    nullable: true,
    maxLength: 2000,
  })
  @IsOptional()
  @IsString()
  @MaxLength(2000)
  note?: string | null;
}
