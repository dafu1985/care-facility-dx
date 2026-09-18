import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { AuthModule } from '../auth/auth.module';

import { Inquiry } from './entities/inquiry.entity';
import { InquiryMessage } from './entities/inquiry-message.entity';
import { InquiriesController } from './inquiries.controller';
import { InquiriesService } from './inquiries.service';
import { InquiryReadStatus } from './entities/inquiry-read-status.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Inquiry, InquiryMessage, InquiryReadStatus]),
    AuthModule,
  ],
  controllers: [InquiriesController],
  providers: [InquiriesService],
  exports: [TypeOrmModule, InquiriesService],
})
export class InquiriesModule {}
