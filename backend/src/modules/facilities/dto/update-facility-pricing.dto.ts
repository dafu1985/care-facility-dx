import { IsInt, IsOptional, IsString, MaxLength, Min } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateFacilityPricingDto {
  @ApiPropertyOptional({
    description: '月額料金の最低額',
    example: 120000,
  })
  @IsOptional()
  @IsInt()
  @Min(0)
  monthlyCostMin?: number;

  @ApiPropertyOptional({
    description: '月額料金の最高額',
    example: 180000,
  })
  @IsOptional()
  @IsInt()
  @Min(0)
  monthlyCostMax?: number;

  @ApiPropertyOptional({
    description: '入居一時金',
    example: 0,
  })
  @IsOptional()
  @IsInt()
  @Min(0)
  entranceFee?: number;

  @ApiPropertyOptional({
    description: '料金に関する補足',
    example: '医療費・介護保険自己負担分は別途必要です。',
    nullable: true,
    maxLength: 2000,
  })
  @IsOptional()
  @IsString()
  @MaxLength(2000)
  note?: string | null;
}
