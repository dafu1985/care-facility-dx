import {
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { DataSource } from 'typeorm';

import { CreateInquiryDto } from './dto/create-inquiry.dto';
import { CreateInquiryMessageDto } from './dto/create-inquiry-message.dto';
import { InquirySearchDto } from './dto/inquiry-search.dto';
import { UpdateInquiryStatusDto } from './dto/update-inquiry-status.dto';
import {
  InquiryListResponseDto,
  InquiryResponseDto,
} from './dto/inquiry-response.dto';
import { Inquiry, InquiryStatus } from './entities/inquiry.entity';
import {
  InquiryMessage,
  InquiryMessageType,
} from './entities/inquiry-message.entity';
import { InquiryMapper } from './inquiry.mapper';

@Injectable()
export class InquiriesService {
  constructor(
    private readonly dataSource: DataSource,
  ) {}

  async create(
    dto: CreateInquiryDto,
  ): Promise<Inquiry> {
    return this.dataSource.transaction(
      async (manager) => {
        const inquiryRepository =
          manager.getRepository(Inquiry);

        const messageRepository =
          manager.getRepository(InquiryMessage);

        const now = new Date();

        const inquiry = inquiryRepository.create({
          facilityId: dto.facilityId,
          createdByUserId: dto.createdByUserId,
          subject: dto.subject,
          status: InquiryStatus.OPEN,
          lastMessageAt: now,
        });

        const savedInquiry =
          await inquiryRepository.save(inquiry);

        const message = messageRepository.create({
          inquiryId: savedInquiry.inquiryId,
          senderUserId: dto.createdByUserId,
          type: InquiryMessageType.MESSAGE,
          body: dto.body,
        });

        await messageRepository.save(message);

        return savedInquiry;
      },
    );
  }

  async findAll(
    query: InquirySearchDto,
  ): Promise<InquiryListResponseDto> {
    const inquiryRepository =
      this.dataSource.getRepository(Inquiry);

    const queryBuilder = inquiryRepository
      .createQueryBuilder('inquiry');

    if (query.createdByUserId) {
      queryBuilder.andWhere(
        'inquiry.createdByUserId = :createdByUserId',
        {
          createdByUserId: query.createdByUserId,
        },
      );
    }

    if (query.facilityId) {
      queryBuilder.andWhere(
        'inquiry.facilityId = :facilityId',
        {
          facilityId: query.facilityId,
        },
      );
    }

    if (query.status) {
      queryBuilder.andWhere(
        'inquiry.status = :status',
        {
          status: query.status,
        },
      );
    }

    queryBuilder
      .orderBy(
        'inquiry.lastMessageAt',
        'DESC',
        'NULLS LAST',
      )
      .addOrderBy(
        'inquiry.createdAt',
        'DESC',
      )
      .addOrderBy(
        'inquiry.inquiryId',
        'ASC',
      );

    const page = query.page ?? 1;
    const pageSize = query.pageSize ?? 20;

    queryBuilder
      .skip((page - 1) * pageSize)
      .take(pageSize);

    const [inquiries, total] =
      await queryBuilder.getManyAndCount();

    return {
      items: InquiryMapper.toListResponse(inquiries),
      page,
      pageSize,
      total,
    };
  }

  async findOne(
    inquiryId: string,
  ): Promise<InquiryResponseDto> {
    const inquiryRepository =
      this.dataSource.getRepository(Inquiry);

    const inquiry = await inquiryRepository
      .createQueryBuilder('inquiry')
      .leftJoinAndSelect(
        'inquiry.messages',
        'message',
      )
      .where(
        'inquiry.inquiryId = :inquiryId',
        {
          inquiryId,
        },
      )
      .orderBy(
        'message.createdAt',
        'ASC',
      )
      .getOne();

    if (!inquiry) {
      throw new NotFoundException(
        'Inquiry not found',
      );
    }

    return InquiryMapper.toResponse(inquiry);
  }

  async addMessage(
    inquiryId: string,
    dto: CreateInquiryMessageDto,
  ): Promise<InquiryMessage> {
    return this.dataSource.transaction(
      async (manager) => {
        const inquiryRepository =
          manager.getRepository(Inquiry);

        const messageRepository =
          manager.getRepository(InquiryMessage);

        const inquiry =
          await inquiryRepository.findOne({
            where: {
              inquiryId,
            },
          });

        if (!inquiry) {
          throw new NotFoundException(
            'Inquiry not found',
          );
        }

        const message = messageRepository.create({
          inquiryId,
          senderUserId: dto.senderUserId,
          type: InquiryMessageType.MESSAGE,
          body: dto.body,
        });

        const savedMessage =
          await messageRepository.save(message);

        inquiry.lastMessageAt =
          savedMessage.createdAt;

        await inquiryRepository.save(inquiry);

        return savedMessage;
      },
    );
  }

  async updateStatus(
    inquiryId: string,
    dto: UpdateInquiryStatusDto,
  ): Promise<InquiryResponseDto> {
    await this.dataSource.transaction(
      async (manager) => {
        const inquiryRepository =
          manager.getRepository(Inquiry);

        const messageRepository =
          manager.getRepository(InquiryMessage);

        const inquiry =
          await inquiryRepository.findOne({
            where: {
              inquiryId,
            },
          });

        if (!inquiry) {
          throw new NotFoundException(
            'Inquiry not found',
          );
        }

        const previousStatus = inquiry.status;

        inquiry.status = dto.status;

        const savedInquiry =
          await inquiryRepository.save(inquiry);

        const statusMessage =
          messageRepository.create({
            inquiryId,
            senderUserId: null,
            type: InquiryMessageType.STATUS_CHANGE,
            body: `Status changed from ${previousStatus} to ${dto.status}`,
          });

        const savedMessage =
          await messageRepository.save(statusMessage);

        savedInquiry.lastMessageAt =
          savedMessage.createdAt;

        await inquiryRepository.save(savedInquiry);
      },
    );

    return this.findOne(inquiryId);
  }
}