import { ApiProperty } from '@nestjs/swagger';

export class FacilityPricingResponseDto {
  @ApiProperty({
    description: '料金情報ID',
    example: 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa',
  })
  pricingId: string;

  @ApiProperty({
    description: '施設ID',
    example: '5ea06a45-7587-4198-b94c-56e0044399c7',
  })
  facilityId: string;

  @ApiProperty({
    description: '月額料金の最低額',
    example: 120000,
  })
  monthlyCostMin: number;

  @ApiProperty({
    description: '月額料金の最高額',
    example: 180000,
  })
  monthlyCostMax: number;

  @ApiProperty({
    description: '入居一時金',
    example: 0,
  })
  entranceFee: number;

  @ApiProperty({
    description: '料金に関する補足',
    example: '医療費・介護保険自己負担分は別途必要です。',
    nullable: true,
  })
  note: string | null;

  @ApiProperty({
    description: '最終更新日時',
    example: '2026-09-09T08:00:00.000Z',
  })
  updatedAt: Date;
}
