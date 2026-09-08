import {
  IsNotEmpty,
  IsString,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateInquiryMessageDto {
  @ApiProperty({
    description: 'メッセージ本文',
    example: '現在2床空いています。来週の見学も可能です。',
  })
  @IsString()
  @IsNotEmpty()
  body: string;
}