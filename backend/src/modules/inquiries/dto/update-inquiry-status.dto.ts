import { IsEnum } from 'class-validator';

import { InquiryStatus } from '../entities/inquiry.entity';

export class UpdateInquiryStatusDto {
  @IsEnum(InquiryStatus)
  status: InquiryStatus;
}