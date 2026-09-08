import { ApiProperty } from '@nestjs/swagger';

export class FacilityRequirementResponseDto {
  @ApiProperty({
    description: '受入条件ID',
    example: 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa',
  })
  requirementId: string;

  @ApiProperty({
    description: '施設ID',
    example: '5ea06a45-7587-4198-b94c-56e0044399c7',
  })
  facilityId: string;

  @ApiProperty({
    description: '最低要介護度',
    example: 1,
    nullable: true,
  })
  minCareLevel: number | null;

  @ApiProperty({
    description: '最高要介護度',
    example: 5,
    nullable: true,
  })
  maxCareLevel: number | null;

  @ApiProperty({
    description: '認知症受け入れ可否',
    example: true,
  })
  dementiaAccepted: boolean;

  @ApiProperty({
    description: '医療ケア受け入れ可否',
    example: true,
  })
  medicalCareAccepted: boolean;

  @ApiProperty({
    description: '車椅子受け入れ可否',
    example: true,
  })
  wheelchairAccepted: boolean;

  @ApiProperty({
    description: '看取り対応可否',
    example: false,
  })
  endOfLifeCare: boolean;

  @ApiProperty({
    description: '補足',
    example: '要介護3以上は事前面談が必要です。',
    nullable: true,
  })
  note: string | null;

  @ApiProperty({
    description: '最終更新日時',
    example: '2026-09-08T13:30:00.000Z',
  })
  updatedAt: Date;
}
