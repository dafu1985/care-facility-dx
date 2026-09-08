import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import {
  DataSource,
  EntityManager,
} from 'typeorm';

import type { AuthenticatedUser } from '../auth/jwt.strategy';
import {
  FacilityStaff,
  FacilityStaffStatus,
} from '../facilities/entities/facility-staff.entity';
import { UserRole } from '../users/entities/user.entity';

import { CreateInquiryDto } from './dto/create-inquiry.dto';
import { CreateInquiryMessageDto } from './dto/create-inquiry-message.dto';
import { InquirySearchDto } from './dto/inquiry-search.dto';
import { UpdateInquiryStatusDto } from './dto/update-inquiry-status.dto';
import {
  CreateInquiryResponseDto,
  InquiryListResponseDto,
  InquiryMessageResponseDto,
  InquiryResponseDto,
} from './dto/inquiry-response.dto';
import {
  Inquiry,
  InquiryStatus,
} from './entities/inquiry.entity';
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

  /**
   * 問い合わせ作成
   *
   * CARE_MANAGER:
   * 自分自身のユーザーIDで問い合わせを作成する。
   *
   * ADMIN:
   * 管理用途として作成可能。
   *
   * FACILITY:
   * 問い合わせの新規作成は不可。
   */
  async create(
    dto: CreateInquiryDto,
    user: AuthenticatedUser,
  ): Promise<CreateInquiryResponseDto> {
    if (
      user.role !== UserRole.CARE_MANAGER &&
      user.role !== UserRole.ADMIN
    ) {
      throw new ForbiddenException(
        'You are not allowed to create inquiries',
      );
    }

    const savedInquiry =
      await this.dataSource.transaction(
        async (manager) => {
          const inquiryRepository =
            manager.getRepository(Inquiry);

          const messageRepository =
            manager.getRepository(InquiryMessage);

          const now = new Date();

          const inquiry = inquiryRepository.create({
            facilityId: dto.facilityId,
            createdByUserId: user.userId,
            subject: dto.subject,
            status: InquiryStatus.OPEN,
            lastMessageAt: now,
          });

          const saved =
            await inquiryRepository.save(inquiry);

          const message =
            messageRepository.create({
              inquiryId: saved.inquiryId,
              senderUserId: user.userId,
              type: InquiryMessageType.MESSAGE,
              body: dto.body,
            });

          await messageRepository.save(message);

          return saved;
        },
      );

    return InquiryMapper.toCreateResponse(
      savedInquiry,
    );
  }

  /**
   * 問い合わせ一覧取得
   *
   * CARE_MANAGER:
   * 自分が作成した問い合わせのみ。
   *
   * FACILITY:
   * 自分が所属する施設宛の問い合わせのみ。
   *
   * ADMIN:
   * 全問い合わせ。
   */
  async findAll(
    query: InquirySearchDto,
    user: AuthenticatedUser,
  ): Promise<InquiryListResponseDto> {
    const inquiryRepository =
      this.dataSource.getRepository(Inquiry);

    const queryBuilder =
      inquiryRepository.createQueryBuilder(
        'inquiry',
      );

    // ケアマネは自分の問い合わせのみ
    if (user.role === UserRole.CARE_MANAGER) {
      queryBuilder.andWhere(
        'inquiry.createdByUserId = :createdByUserId',
        {
          createdByUserId: user.userId,
        },
      );
    }

    // 施設職員は所属施設宛のみ
    else if (user.role === UserRole.FACILITY) {
      const facilityIds =
        await this.getActiveFacilityIds(
          user.userId,
          this.dataSource.manager,
        );

      if (facilityIds.length === 0) {
        throw new ForbiddenException(
          'No active facility assignment found',
        );
      }

      queryBuilder.andWhere(
        'inquiry.facilityId IN (:...facilityIds)',
        {
          facilityIds,
        },
      );
    }

    // ADMINは任意ユーザーで検索可能
    else if (user.role === UserRole.ADMIN) {
      if (query.createdByUserId) {
        queryBuilder.andWhere(
          'inquiry.createdByUserId = :createdByUserId',
          {
            createdByUserId:
              query.createdByUserId,
          },
        );
      }
    }

    // 想定外ロール
    else {
      throw new ForbiddenException(
        'You are not allowed to access inquiries',
      );
    }

    /**
     * facilityIdによる追加検索。
     *
     * FACILITYの場合も、上記の所属施設条件と
     * AND条件になるため他施設は取得できない。
     */
    if (query.facilityId) {
      queryBuilder.andWhere(
        'inquiry.facilityId = :facilityId',
        {
          facilityId: query.facilityId,
        },
      );
    }

    // ステータス
    if (query.status) {
      queryBuilder.andWhere(
        'inquiry.status = :status',
        {
          status: query.status,
        },
      );
    }

    // 最新のやり取り順
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

    // ページネーション
    const page = query.page ?? 1;
    const pageSize = query.pageSize ?? 20;

    queryBuilder
      .skip((page - 1) * pageSize)
      .take(pageSize);

    const [inquiries, total] =
      await queryBuilder.getManyAndCount();

    return {
      items:
        InquiryMapper.toListResponse(
          inquiries,
        ),
      page,
      pageSize,
      total,
    };
  }

  /**
   * 問い合わせ詳細取得
   */
  async findOne(
    inquiryId: string,
    user: AuthenticatedUser,
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

    await this.assertInquiryAccess(
      inquiry,
      user,
      this.dataSource.manager,
    );

    return InquiryMapper.toResponse(inquiry);
  }

  /**
   * メッセージ追加
   */
  async addMessage(
    inquiryId: string,
    dto: CreateInquiryMessageDto,
    user: AuthenticatedUser,
  ): Promise<InquiryMessageResponseDto> {
    const savedMessage =
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

          await this.assertInquiryAccess(
            inquiry,
            user,
            manager,
          );

          const message =
            messageRepository.create({
              inquiryId,
              senderUserId: user.userId,
              type: InquiryMessageType.MESSAGE,
              body: dto.body,
            });

          const saved =
            await messageRepository.save(
              message,
            );

          inquiry.lastMessageAt =
            saved.createdAt;

          await inquiryRepository.save(
            inquiry,
          );

          return saved;
        },
      );

    return InquiryMapper.toMessageResponse(
      savedMessage,
    );
  }

  /**
   * 問い合わせステータス更新
   */
  async updateStatus(
    inquiryId: string,
    dto: UpdateInquiryStatusDto,
    user: AuthenticatedUser,
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

        await this.assertInquiryAccess(
          inquiry,
          user,
          manager,
        );

        const previousStatus =
          inquiry.status;

        inquiry.status = dto.status;

        const savedInquiry =
          await inquiryRepository.save(
            inquiry,
          );

        const statusMessage =
          messageRepository.create({
            inquiryId,
            senderUserId: null,
            type:
              InquiryMessageType.STATUS_CHANGE,
            body:
              `Status changed from ` +
              `${previousStatus} to ${dto.status}`,
          });

        const savedMessage =
          await messageRepository.save(
            statusMessage,
          );

        savedInquiry.lastMessageAt =
          savedMessage.createdAt;

        await inquiryRepository.save(
          savedInquiry,
        );
      },
    );

    return this.findOne(
      inquiryId,
      user,
    );
  }

  /**
   * ユーザーがACTIVE状態で所属している施設ID一覧を取得する。
   */
  private async getActiveFacilityIds(
    userId: string,
    manager: EntityManager,
  ): Promise<string[]> {
    const facilityStaffRepository =
      manager.getRepository(FacilityStaff);

    const facilityStaffList =
      await facilityStaffRepository.find({
        where: {
          userId,
          status:
            FacilityStaffStatus.ACTIVE,
        },
      });

    return facilityStaffList.map(
      (facilityStaff) =>
        facilityStaff.facilityId,
    );
  }

  /**
   * 問い合わせへのアクセス権を確認する。
   *
   * CARE_MANAGER:
   * 自分が作成した問い合わせのみ。
   *
   * FACILITY:
   * 自分がACTIVE状態で所属している施設宛のみ。
   *
   * ADMIN:
   * 全問い合わせ。
   */
  private async assertInquiryAccess(
    inquiry: Inquiry,
    user: AuthenticatedUser,
    manager: EntityManager,
  ): Promise<void> {
    // ADMINは全問い合わせへアクセス可能
    if (user.role === UserRole.ADMIN) {
      return;
    }

    // CARE_MANAGERは自分の問い合わせのみ
    if (
      user.role === UserRole.CARE_MANAGER &&
      inquiry.createdByUserId ===
        user.userId
    ) {
      return;
    }

    // FACILITYは所属施設宛のみ
    if (user.role === UserRole.FACILITY) {
      const facilityStaffRepository =
        manager.getRepository(
          FacilityStaff,
        );

      const facilityStaff =
        await facilityStaffRepository.findOne({
          where: {
            userId: user.userId,
            facilityId:
              inquiry.facilityId,
            status:
              FacilityStaffStatus.ACTIVE,
          },
        });

      if (facilityStaff) {
        return;
      }
    }

    throw new ForbiddenException(
      'You do not have permission to access this inquiry',
    );
  }
}