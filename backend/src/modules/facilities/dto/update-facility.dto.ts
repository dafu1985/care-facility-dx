import { IsOptional, IsString, IsUUID, MaxLength } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateFacilityDto {
  @ApiPropertyOptional({
    description: '施設種別ID',
    example: '11111111-1111-4111-8111-111111111111',
  })
  @IsOptional()
  @IsUUID()
  facilityTypeId?: string;

  @ApiPropertyOptional({
    description: '施設名',
    example: 'サンプル介護ホーム',
    maxLength: 255,
  })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  name?: string;

  @ApiPropertyOptional({
    description: '郵便番号',
    example: '950-0000',
    nullable: true,
    maxLength: 20,
  })
  @IsOptional()
  @IsString()
  @MaxLength(20)
  postalCode?: string | null;

  @ApiPropertyOptional({
    description: '住所',
    example: '新潟県新潟市中央区○○1-2-3',
    nullable: true,
    maxLength: 500,
  })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  address?: string | null;

  @ApiPropertyOptional({
    description: 'エリア',
    example: '新潟市中央区',
    nullable: true,
    maxLength: 100,
  })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  area?: string;

  @ApiPropertyOptional({
    description: '電話番号',
    example: '025-123-4567',
    nullable: true,
    maxLength: 30,
  })
  @IsOptional()
  @IsString()
  @MaxLength(30)
  phone?: string | null;

  @ApiPropertyOptional({
    description: '施設説明',
    example: '24時間スタッフ常駐の介護施設です。',
    nullable: true,
    maxLength: 3000,
  })
  @IsOptional()
  @IsString()
  @MaxLength(3000)
  description?: string | null;
}
