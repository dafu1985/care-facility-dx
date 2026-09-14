import {
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
  MaxLength,
} from 'class-validator';
import {
  ApiProperty,
  ApiPropertyOptional,
} from '@nestjs/swagger';

export class CreateInquiryDto {
  @ApiProperty({
    description: '問い合わせ先施設ID',
    example: '5ea06a45-7587-4198-b94c-56e0044399c7',
  })
  @IsUUID()
  facilityId: string;

  /**
   * 施設探し案件から問い合わせる場合に指定する案件ID。
   *
   * 従来の施設詳細画面から直接問い合わせる場合は未指定でもよい。
   */
  @ApiPropertyOptional({
    description: '問い合わせ元の施設探し案件ID',
    example: '4d3b87cb-5096-4b26-be90-0ff915b1d6d2',
  })
  @IsOptional()
  @IsUUID()
  placementCaseId?: string;

  /**
   * マッチング候補施設から問い合わせる場合に指定する候補施設ID。
   *
   * placementCaseId と組み合わせることで、
   * どの候補施設に問い合わせたかを追跡できる。
   */
  @ApiPropertyOptional({
    description: '問い合わせ対象の候補施設ID',
    example: 'c2e29b17-817d-4ae1-83e3-406a531c9f18',
  })
  @IsOptional()
  @IsUUID()
  candidateFacilityId?: string;

  @ApiProperty({
    description: '問い合わせ件名',
    example: '空き状況について',
    maxLength: 255,
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  subject: string;

  @ApiProperty({
    description: '初回問い合わせメッセージ本文',
    example: '要介護3の利用者について、現在受け入れ可能でしょうか。',
  })
  @IsString()
  @IsNotEmpty()
  body: string;
}
