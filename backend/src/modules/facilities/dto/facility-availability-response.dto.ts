import { ApiProperty } from '@nestjs/swagger';

import { AvailabilityStatus } from '../entities/facility-availability.entity';

export class FacilityAvailabilityResponseDto {
  @ApiProperty({
    description: '空き状況ID',
    example: 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa',
  })
  availabilityId: string;

  @ApiProperty({
    description: '施設ID',
    example: '5ea06a45-7587-4198-b94c-56e0044399c7',
  })
  facilityId: string;

  @ApiProperty({
    description: '空き状況',
    enum: AvailabilityStatus,
    example: AvailabilityStatus.AVAILABLE,
  })
  status: AvailabilityStatus;

  @ApiProperty({
    description: '受け入れ可能人数',
    example: 2,
    nullable: true,
  })
  availableCount: number | null;

  @ApiProperty({
    description: '男性向け空床数',
    example: 1,
    nullable: true,
  })
  maleVacancy: number | null;

  @ApiProperty({
    description: '女性向け空床数',
    example: 1,
    nullable: true,
  })
  femaleVacancy: number | null;

  @ApiProperty({
    description: '個室の空床数',
    example: 1,
    nullable: true,
  })
  privateRoomVacancy: number | null;

  @ApiProperty({
    description: '受け入れ可能日',
    example: '2026-09-15',
    nullable: true,
  })
  availableFrom: string | null;

  @ApiProperty({
    description: '空き状況に関する補足',
    example: '現在2床空きがあります。見学対応可能です。',
    nullable: true,
  })
  note: string | null;

  @ApiProperty({
    description: '最終更新ユーザーID',
    example: 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa',
    nullable: true,
  })
  updatedBy: string | null;

  @ApiProperty({
    description: '最終更新日時',
    example: '2026-09-08T07:00:00.000Z',
  })
  updatedAt: Date;
}
