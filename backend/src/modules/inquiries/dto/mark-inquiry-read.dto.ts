import { ApiProperty } from '@nestjs/swagger';
import { IsUUID } from 'class-validator';

export class MarkInquiryReadDto {
  @ApiProperty({
    description: '画面上で確認した最後のメッセージID',
    format: 'uuid',
  })
  @IsUUID()
  messageId: string;
}