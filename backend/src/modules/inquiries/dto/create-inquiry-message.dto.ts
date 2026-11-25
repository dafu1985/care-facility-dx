import { IsNotEmpty, IsString, MaxLength } from 'class-validator';
import { Transform } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

/**
 * 問い合わせメッセージ本文の最大文字数。
 */
export const INQUIRY_MESSAGE_MAX_LENGTH = 2000;

/**
 * 問い合わせメッセージ送信用DTO。
 */
export class CreateInquiryMessageDto {
  @ApiProperty({
    description: 'メッセージ本文',
    example: '現在2床空いています。来週の見学も可能です。',
    minLength: 1,
    maxLength: INQUIRY_MESSAGE_MAX_LENGTH,
  })
  @Transform(({ value }: { value: unknown }) =>
    typeof value === 'string' ? value.trim() : value,
  )
  @IsString()
  @IsNotEmpty({
    message: 'Message body must not be empty',
  })
  @MaxLength(INQUIRY_MESSAGE_MAX_LENGTH, {
    message: `Message body must not exceed ${INQUIRY_MESSAGE_MAX_LENGTH} characters`,
  })
  body: string;
}
