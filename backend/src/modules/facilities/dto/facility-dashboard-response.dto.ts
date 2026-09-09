import { ApiProperty } from '@nestjs/swagger';

import { FacilityResponseDto } from './facility-response.dto';

export class FacilityDashboardResponseDto {
  /**
   * 施設情報。
   *
   * 基本情報・空き状況・料金・受入条件を含む。
   */
  @ApiProperty({
    description: '施設ダッシュボード用施設情報',
    type: FacilityResponseDto,
  })
  facility: FacilityResponseDto;

  /**
   * 各情報が登録済みかどうか。
   *
   * フロント側で、
   * 「料金情報を入力してください」
   * などの表示に利用する。
   */
  @ApiProperty({
    description: '施設情報の登録状況',
    example: {
      availability: true,
      pricing: true,
      requirement: true,
    },
  })
  completion: {
    availability: boolean;

    pricing: boolean;

    requirement: boolean;
  };
}
