import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { AuthModule } from '../auth/auth.module';

import { Inquiry } from './entities/inquiry.entity';
import { InquiryMessage } from './entities/inquiry-message.entity';
import { InquiriesController } from './inquiries.controller';
import { InquiriesService } from './inquiries.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Inquiry,
      InquiryMessage,
    ]),
    AuthModule,
  ],
  controllers: [
    InquiriesController,
  ],
  providers: [
    InquiriesService,
  ],
  exports: [
    TypeOrmModule,
    InquiriesService,
  ],
})
export class InquiriesModule {}