import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { Inquiry } from './entities/inquiry.entity';
import { InquiryMessage } from './entities/inquiry-message.entity';
import { InquiriesService } from './inquiries.service';
import { InquiriesController } from './inquiries.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Inquiry,
      InquiryMessage,
    ]),
  ],
  controllers: [InquiriesController],
  providers: [InquiriesService],
  exports: [
    TypeOrmModule,
    InquiriesService,
  ],
})

export class InquiriesModule {}