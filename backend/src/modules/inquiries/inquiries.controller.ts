import {
  Body,
  Controller,
  Get,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Query,
} from '@nestjs/common';

import { CreateInquiryDto } from './dto/create-inquiry.dto';
import { CreateInquiryMessageDto } from './dto/create-inquiry-message.dto';
import { InquirySearchDto } from './dto/inquiry-search.dto';
import { UpdateInquiryStatusDto } from './dto/update-inquiry-status.dto';
import {
  InquiryListResponseDto,
  InquiryResponseDto,
} from './dto/inquiry-response.dto';
import { Inquiry } from './entities/inquiry.entity';
import { InquiryMessage } from './entities/inquiry-message.entity';
import { InquiriesService } from './inquiries.service';

@Controller('inquiries')
export class InquiriesController {
  constructor(
    private readonly inquiriesService: InquiriesService,
  ) {}

  @Post()
  async create(
    @Body() dto: CreateInquiryDto,
  ): Promise<Inquiry> {
    return this.inquiriesService.create(dto);
  }

  @Get()
  async findAll(
    @Query() query: InquirySearchDto,
  ): Promise<InquiryListResponseDto> {
    return this.inquiriesService.findAll(query);
  }

  @Get(':inquiryId')
  async findOne(
    @Param(
      'inquiryId',
      new ParseUUIDPipe(),
    )
    inquiryId: string,
  ): Promise<InquiryResponseDto> {
    return this.inquiriesService.findOne(inquiryId);
  }

  @Post(':inquiryId/messages')
  async addMessage(
    @Param(
      'inquiryId',
      new ParseUUIDPipe(),
    )
    inquiryId: string,
    @Body() dto: CreateInquiryMessageDto,
  ): Promise<InquiryMessage> {
    return this.inquiriesService.addMessage(
      inquiryId,
      dto,
    );
  }

  @Patch(':inquiryId/status')
  async updateStatus(
    @Param(
      'inquiryId',
      new ParseUUIDPipe(),
    )
    inquiryId: string,
    @Body() dto: UpdateInquiryStatusDto,
  ): Promise<InquiryResponseDto> {
    return this.inquiriesService.updateStatus(
      inquiryId,
      dto,
    );
  }
}