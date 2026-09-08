import {
  IsNotEmpty,
  IsString,
  IsUUID,
  MaxLength,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateInquiryDto {
  @ApiProperty({
    description: '問い合わせ先の施設ID',
    example: '5ea06a45-7587-4198-b94c-56e0044399c7',
  })
  @IsUUID()
  facilityId: string;

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
    description: '初回メッセージ本文',
    example: '要介護3の利用者について、現在受け入れ可能でしょうか。',
  })
  @IsString()
  @IsNotEmpty()
  body: string;
}