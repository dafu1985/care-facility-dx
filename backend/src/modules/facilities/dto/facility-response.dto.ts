import {
  ApiProperty,
  ApiPropertyOptional,
} from '@nestjs/swagger';

export class FacilityTypeResponseDto {
  @ApiProperty({
    description: '施設種別ID',
    example: 'f611d3fa-a0b6-49ef-857e-1b1c15c1248c',
  })
  facilityTypeId: string;

  @ApiProperty({
    description: '施設種別名',
    example: '住宅型有料老人ホーム',
  })
  name: string;
}

export class FacilityAvailabilityResponseDto {
  @ApiProperty({
    description: '空き状況',
    example: 'AVAILABLE',
  })
  status: string;

  @ApiPropertyOptional({
    description: '空き数',
    example: 2,
    nullable: true,
  })
  availableCount: number | null;

  @ApiPropertyOptional({
    description: '入居可能日',
    example: '2026-09-07',
    nullable: true,
  })
  availableFrom: string | null;

  @ApiProperty({
    description: '空き状況の最終更新日時',
    example: '2026-09-07T04:43:36.057Z',
  })
  updatedAt: Date;
}

export class FacilityPricingResponseDto {
  @ApiProperty({
    description: '月額料金の最低額（円）',
    example: 120000,
  })
  monthlyCostMin: number;

  @ApiProperty({
    description: '月額料金の最高額（円）',
    example: 160000,
  })
  monthlyCostMax: number;

  @ApiProperty({
    description: '入居一時金（円）',
    example: 0,
  })
  entranceFee: number;

  @ApiPropertyOptional({
    description: '料金に関する補足',
    example: '月額料金は介護度等により変動します',
    nullable: true,
  })
  note: string | null;
}

export class FacilityRequirementResponseDto {
  @ApiPropertyOptional({
    description: '受入可能な最低要介護度',
    example: 1,
    nullable: true,
  })
  minCareLevel: number | null;

  @ApiPropertyOptional({
    description: '受入可能な最高要介護度',
    example: 5,
    nullable: true,
  })
  maxCareLevel: number | null;

  @ApiProperty({
    description: '認知症対応可否',
    example: true,
  })
  dementiaAccepted: boolean;

  @ApiProperty({
    description: '医療ケア対応可否',
    example: true,
  })
  medicalCareAccepted: boolean;

  @ApiProperty({
    description: '車椅子対応可否',
    example: true,
  })
  wheelchairAccepted: boolean;

  @ApiProperty({
    description: '看取り対応可否',
    example: true,
  })
  endOfLifeCare: boolean;

  @ApiPropertyOptional({
    description: '受入条件に関する補足',
    example: '要介護1〜5、認知症・医療ケア・看取り対応可',
    nullable: true,
  })
  note: string | null;
}

export class FacilityResponseDto {
  @ApiProperty({
    description: '施設ID',
    example: '5ea06a45-7587-4198-b94c-56e0044399c7',
  })
  facilityId: string;

  @ApiProperty({
    description: '施設名',
    example: 'サンプル介護ホーム',
  })
  name: string;

  @ApiPropertyOptional({
    description: '郵便番号',
    example: '950-0000',
    nullable: true,
  })
  postalCode: string | null;

  @ApiPropertyOptional({
    description: '住所',
    example: '新潟県新潟市中央区サンプル1-1-1',
    nullable: true,
  })
  address: string | null;

  @ApiProperty({
    description: 'エリア',
    example: '新潟市中央区',
  })
  area: string;

  @ApiPropertyOptional({
    description: '電話番号',
    example: '025-000-0000',
    nullable: true,
  })
  phone: string | null;

  @ApiPropertyOptional({
    description: '施設説明',
    example: '開発確認用のサンプル施設です',
    nullable: true,
  })
  description: string | null;

  @ApiProperty({
    description: '施設ステータス',
    example: 'ACTIVE',
  })
  status: string;

  @ApiPropertyOptional({
    description: '施設種別',
    type: () => FacilityTypeResponseDto,
    nullable: true,
  })
  facilityType: FacilityTypeResponseDto | null;

  @ApiPropertyOptional({
    description: '空き状況',
    type: () => FacilityAvailabilityResponseDto,
    nullable: true,
  })
  availability: FacilityAvailabilityResponseDto | null;

  @ApiPropertyOptional({
    description: '料金情報',
    type: () => FacilityPricingResponseDto,
    nullable: true,
  })
  pricing: FacilityPricingResponseDto | null;

  @ApiPropertyOptional({
    description: '受入条件',
    type: () => FacilityRequirementResponseDto,
    nullable: true,
  })
  requirement: FacilityRequirementResponseDto | null;
}

export class FacilityListResponseDto {
  @ApiProperty({
    description: '施設一覧',
    type: () => FacilityResponseDto,
    isArray: true,
  })
  items: FacilityResponseDto[];

  @ApiProperty({
    description: '現在のページ番号',
    example: 1,
  })
  page: number;

  @ApiProperty({
    description: '1ページあたりの件数',
    example: 20,
  })
  pageSize: number;

  @ApiProperty({
    description: '検索条件に一致した総件数',
    example: 3,
  })
  total: number;
}