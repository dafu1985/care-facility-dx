import { IsEnum } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

import { InquiryStatus } from '../entities/inquiry.entity';

export class UpdateInquiryStatusDto {
  @ApiProperty({
    description: '更新後の問い合わせステータス',
    enum: InquiryStatus,
    example: InquiryStatus.ANSWERED,
  })
  @IsEnum(InquiryStatus)
  status: InquiryStatus;
}