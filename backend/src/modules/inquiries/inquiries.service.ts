import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { DataSource, EntityManager, In } from 'typeorm';

import type { AuthenticatedUser } from '../auth/jwt.strategy';
import {
  FacilityStaff,
  FacilityStaffStatus,
} from '../facilities/entities/facility-staff.entity';
import { UserRole } from '../users/entities/user.entity';
import {
  CandidateFacility,
  CandidateFacilityStatus,
} from '../placement-cases/entities/candidate-facility.entity';
import {
  PlacementCase,
  PlacementCaseStatus,
} from '../placement-cases/entities/placement-case.entity';

import { CreateInquiryDto } from './dto/create-inquiry.dto';
import { CreateInquiryMessageDto } from './dto/create-inquiry-message.dto';
import { InquirySearchDto } from './dto/inquiry-search.dto';
import { MarkInquiryReadDto } from './dto/mark-inquiry-read.dto';
import { UpdateInquiryStatusDto } from './dto/update-inquiry-status.dto';
import {
  CreateInquiryResponseDto,
  InquiryListResponseDto,
  InquiryMessageResponseDto,
  InquiryResponseDto,
  InquiryUnreadSummaryResponseDto,
} from './dto/inquiry-response.dto';
import { Inquiry, InquiryStatus } from './entities/inquiry.entity';
import {
  InquiryMessage,
  InquiryMessageType,
} from './entities/inquiry-message.entity';
import { InquiryReadStatus } from './entities/inquiry-read-status.entity';
import { InquiryMapper } from './inquiry.mapper';

/**
 * 問い合わせステータスの日本語表示名を取得する。
 */
function getInquiryStatusLabel(status: InquiryStatus): string {
  switch (status) {
    case InquiryStatus.OPEN:
      return '未対応';

    case InquiryStatus.IN_PROGRESS:
      return '対応中';

    case InquiryStatus.ANSWERED:
      return '回答済み';

    case InquiryStatus.CLOSED:
      return '完了';

    default:
      return status;
  }
}

@Injectable()
export class InquiriesService {
  constructor(private readonly dataSource: DataSource) {}

  /**
   * 問い合わせ作成。
   *
   * CARE_MANAGER:
   * 自分のユーザーIDで問い合わせを作成する。
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
    if (user.role !== UserRole.CARE_MANAGER && user.role !== UserRole.ADMIN) {
      throw new ForbiddenException('You are not allowed to create inquiries');
    }

    const savedInquiry = await this.dataSource.transaction(async (manager) => {
      const inquiryRepository = manager.getRepository(Inquiry);
      const messageRepository = manager.getRepository(InquiryMessage);

      // 案件・候補施設が指定された場合、検証後のEntityを保持する。
      // Inquiry作成後のステータス連動更新で使用する。
      let placementCase: PlacementCase | null = null;
      let candidateFacility: CandidateFacility | null = null;

      /**
       * 案件IDが指定されている場合は、
       * 案件の存在確認と所有者確認を行う。
       */
      if (dto.placementCaseId) {
        const placementCaseRepository = manager.getRepository(PlacementCase);

        placementCase = await placementCaseRepository.findOne({
          where: {
            placementCaseId: dto.placementCaseId,
          },
        });

        if (!placementCase) {
          throw new NotFoundException('Placement case not found');
        }

        if (
          user.role === UserRole.CARE_MANAGER &&
          placementCase.careManagerId !== user.userId
        ) {
          throw new ForbiddenException(
            'You do not have permission to use this placement case',
          );
        }
      }

      /**
       * candidateFacilityId を指定する場合は
       * placementCaseId も必須。
       */
      if (dto.candidateFacilityId && !dto.placementCaseId) {
        throw new BadRequestException(
          'placementCaseId is required when candidateFacilityId is specified',
        );
      }

      /**
       * 候補施設が指定された案件と施設に
       * 正しく紐付いているか確認する。
       */
      if (dto.candidateFacilityId) {
        const candidateFacilityRepository =
          manager.getRepository(CandidateFacility);

        candidateFacility = await candidateFacilityRepository.findOne({
          where: {
            candidateFacilityId: dto.candidateFacilityId,
          },
        });

        if (!candidateFacility) {
          throw new NotFoundException('Candidate facility not found');
        }

        if (candidateFacility.placementCaseId !== dto.placementCaseId) {
          throw new BadRequestException(
            'Candidate facility does not belong to the specified placement case',
          );
        }

        if (candidateFacility.facilityId !== dto.facilityId) {
          throw new BadRequestException(
            'Candidate facility does not match the specified facility',
          );
        }
      }

      /**
       * 同じ候補施設に対して進行中の問い合わせが既に存在する場合は、
       * 重複して新しいInquiryを作成しない。
       */
      if (dto.candidateFacilityId) {
        const existingInquiry = await inquiryRepository.findOne({
          where: {
            candidateFacilityId: dto.candidateFacilityId,
            status: In([
              InquiryStatus.OPEN,
              InquiryStatus.IN_PROGRESS,
              InquiryStatus.ANSWERED,
            ]),
          },
        });

        if (existingInquiry) {
          throw new ConflictException(
            'An active inquiry already exists for this candidate facility',
          );
        }
      }

      const now = new Date();

      const inquiry = inquiryRepository.create({
        facilityId: dto.facilityId,
        createdByUserId: user.userId,
        placementCaseId: dto.placementCaseId ?? null,
        candidateFacilityId: dto.candidateFacilityId ?? null,
        subject: dto.subject,
        status: InquiryStatus.OPEN,
        lastMessageAt: now,
      });

      const saved = await inquiryRepository.save(inquiry);

      const message = messageRepository.create({
        inquiryId: saved.inquiryId,
        senderUserId: user.userId,
        type: InquiryMessageType.MESSAGE,
        body: dto.body,
      });

      await messageRepository.save(message);

      /**
       * 候補施設経由の問い合わせの場合、
       * 候補施設ステータスを INQUIRING に更新する。
       */
      if (candidateFacility) {
        const candidateFacilityRepository =
          manager.getRepository(CandidateFacility);

        candidateFacility.status = CandidateFacilityStatus.INQUIRING;

        await candidateFacilityRepository.save(candidateFacility);
      }

      /**
       * 案件に紐づく問い合わせの場合、
       * 案件ステータスを INQUIRING に更新する。
       */
      if (placementCase) {
        const placementCaseRepository = manager.getRepository(PlacementCase);

        placementCase.status = PlacementCaseStatus.INQUIRING;

        await placementCaseRepository.save(placementCase);
      }

      return saved;
    });

    return InquiryMapper.toCreateResponse(savedInquiry);
  }

  /**
   * 問い合わせ一覧取得。
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
    const inquiryRepository = this.dataSource.getRepository(Inquiry);

    const queryBuilder = inquiryRepository
      .createQueryBuilder('inquiry')
      .leftJoinAndSelect('inquiry.facility', 'facility');

    // ケアマネは自分の問い合わせのみ
    if (user.role === UserRole.CARE_MANAGER) {
      queryBuilder.andWhere('inquiry.createdByUserId = :createdByUserId', {
        createdByUserId: user.userId,
      });
    }

    // 施設職員は所属施設宛のみ
    else if (user.role === UserRole.FACILITY) {
      const facilityIds = await this.getActiveFacilityIds(
        user.userId,
        this.dataSource.manager,
      );

      if (facilityIds.length === 0) {
        throw new ForbiddenException('No active facility assignment found');
      }

      queryBuilder.andWhere('inquiry.facilityId IN (:...facilityIds)', {
        facilityIds,
      });
    }

    // ADMINは任意ユーザーで検索可能
    else if (user.role === UserRole.ADMIN) {
      if (query.createdByUserId) {
        queryBuilder.andWhere('inquiry.createdByUserId = :createdByUserId', {
          createdByUserId: query.createdByUserId,
        });
      }
    }

    // 想定外ロール
    else {
      throw new ForbiddenException('You are not allowed to access inquiries');
    }

    /**
     * facilityIdによる追加検索。
     *
     * FACILITYの場合も、上記の所属施設条件と
     * AND条件になるため他施設は取得できない。
     */
    if (query.facilityId) {
      queryBuilder.andWhere('inquiry.facilityId = :facilityId', {
        facilityId: query.facilityId,
      });
    }

    // ステータス
    if (query.status) {
      queryBuilder.andWhere('inquiry.status = :status', {
        status: query.status,
      });
    }

    // 最新のやり取り順
    queryBuilder
      .orderBy('inquiry.lastMessageAt', 'DESC', 'NULLS LAST')
      .addOrderBy('inquiry.createdAt', 'DESC')
      .addOrderBy('inquiry.inquiryId', 'ASC');

    // ページネーション
    const page = query.page ?? 1;
    const pageSize = query.pageSize ?? 20;

    queryBuilder.skip((page - 1) * pageSize).take(pageSize);

    const [inquiries, total] = await queryBuilder.getManyAndCount();

    return {
      items: InquiryMapper.toListResponse(inquiries),
      page,
      pageSize,
      total,
    };
  }

  /**
   * 問い合わせ詳細取得。
   */
  async findOne(
    inquiryId: string,
    user: AuthenticatedUser,
  ): Promise<InquiryResponseDto> {
    const inquiryRepository = this.dataSource.getRepository(Inquiry);

    const inquiry = await inquiryRepository
      .createQueryBuilder('inquiry')
      .leftJoinAndSelect('inquiry.facility', 'facility')
      .leftJoinAndSelect('inquiry.messages', 'message')
      .where('inquiry.inquiryId = :inquiryId', {
        inquiryId,
      })
      .orderBy('message.createdAt', 'ASC')
      .getOne();

    if (!inquiry) {
      throw new NotFoundException('Inquiry not found');
    }

    await this.assertInquiryAccess(inquiry, user, this.dataSource.manager);

    return InquiryMapper.toResponse(inquiry);
  }

  /**
   * メッセージ追加。
   */
  async addMessage(
    inquiryId: string,
    dto: CreateInquiryMessageDto,
    user: AuthenticatedUser,
  ): Promise<InquiryMessageResponseDto> {
    const savedMessage = await this.dataSource.transaction(async (manager) => {
      const inquiryRepository = manager.getRepository(Inquiry);

      const messageRepository = manager.getRepository(InquiryMessage);

      const inquiry = await inquiryRepository.findOne({
        where: {
          inquiryId,
        },
      });

      if (!inquiry) {
        throw new NotFoundException('Inquiry not found');
      }

      await this.assertInquiryAccess(inquiry, user, manager);

      const message = messageRepository.create({
        inquiryId,
        senderUserId: user.userId,
        type: InquiryMessageType.MESSAGE,
        body: dto.body,
      });

      const saved = await messageRepository.save(message);

      inquiry.lastMessageAt = saved.createdAt;

      await inquiryRepository.save(inquiry);

      return saved;
    });

    return InquiryMapper.toMessageResponse(savedMessage);
  }

  /**
   * 問い合わせステータス更新。
   */
  async updateStatus(
    inquiryId: string,
    dto: UpdateInquiryStatusDto,
    user: AuthenticatedUser,
  ): Promise<InquiryResponseDto> {
    await this.dataSource.transaction(async (manager) => {
      const inquiryRepository = manager.getRepository(Inquiry);

      const messageRepository = manager.getRepository(InquiryMessage);

      const inquiry = await inquiryRepository.findOne({
        where: {
          inquiryId,
        },
      });

      if (!inquiry) {
        throw new NotFoundException('Inquiry not found');
      }

      /**
       * 問い合わせへのアクセス権を確認する。
       */
      await this.assertInquiryAccess(inquiry, user, manager);

      /**
       * ロールごとに許可されたステータス遷移か確認する。
       */
      this.assertStatusTransition(inquiry.status, dto.status, user.role);

      /**
       * 現在と同じステータスが指定された場合は、
       * Inquiry更新・STATUS_CHANGE履歴作成を行わない。
       */
      if (inquiry.status === dto.status) {
        return;
      }

      /**
       * 変更前ステータスを保持する。
       */
      const previousStatus = inquiry.status;

      /**
       * 問い合わせステータスを更新する。
       */
      inquiry.status = dto.status;

      const savedInquiry = await inquiryRepository.save(inquiry);

      /**
       * ステータス変更履歴を作成する。
       *
       * システム扱いのためsenderUserIdはnull。
       */
      const statusMessage = messageRepository.create({
        inquiryId,
        senderUserId: null,
        type: InquiryMessageType.STATUS_CHANGE,
        body: `対応状況を「${getInquiryStatusLabel(previousStatus)}」から「${getInquiryStatusLabel(dto.status)}」に変更しました。`,
      });

      const savedMessage = await messageRepository.save(statusMessage);

      /**
       * ステータス変更履歴も問い合わせ上の
       * 最終アクティビティとして扱う。
       */
      savedInquiry.lastMessageAt = savedMessage.createdAt;

      await inquiryRepository.save(savedInquiry);
    });

    /**
     * 最新状態を詳細レスポンスとして返す。
     */
    return this.findOne(inquiryId, user);
  }

  /**
   * 問い合わせステータスの遷移が、
   * ユーザーのロールに対して許可されているか確認する。
   */
  private assertStatusTransition(
    currentStatus: InquiryStatus,
    nextStatus: InquiryStatus,
    role: UserRole,
  ): void {
    /**
     * 同一ステータスへの更新は許可する。
     *
     * updateStatus() 側で変更なしとして処理される。
     */
    if (currentStatus === nextStatus) {
      return;
    }

    /**
     * ADMINは管理用途としてすべての遷移を許可する。
     */
    if (role === UserRole.ADMIN) {
      return;
    }

    /**
     * 施設職員が行える遷移。
     *
     * OPEN
     *   ↓
     * IN_PROGRESS
     *   ↓
     * ANSWERED
     */
    if (role === UserRole.FACILITY) {
      const allowed =
        (currentStatus === InquiryStatus.OPEN &&
          nextStatus === InquiryStatus.IN_PROGRESS) ||
        (currentStatus === InquiryStatus.IN_PROGRESS &&
          nextStatus === InquiryStatus.ANSWERED);

      if (allowed) {
        return;
      }

      throw new ForbiddenException(
        'This status transition is not allowed for facility users',
      );
    }

    /**
     * ケアマネが行える遷移。
     *
     * ANSWERED → CLOSED
     *
     * また、完了・キャンセル済みでなければ
     * 問い合わせをCANCELLEDにできる。
     */
    if (role === UserRole.CARE_MANAGER) {
      const canClose =
        currentStatus === InquiryStatus.ANSWERED &&
        nextStatus === InquiryStatus.CLOSED;

      const canCancel =
        currentStatus !== InquiryStatus.CLOSED &&
        currentStatus !== InquiryStatus.CANCELLED &&
        nextStatus === InquiryStatus.CANCELLED;

      if (canClose || canCancel) {
        return;
      }

      throw new ForbiddenException(
        'This status transition is not allowed for care manager users',
      );
    }

    throw new ForbiddenException(
      'You are not allowed to update inquiry status',
    );
  }

  /**
   * ログインユーザーの未読メッセージ情報を取得する。
   *
   * 未読対象:
   * - MESSAGEのみ
   * - 自分以外が送信したメッセージのみ
   * - 未読状態が存在しない、またはlastReadAtより新しいメッセージ
   */
  async getUnreadSummary(
    user: AuthenticatedUser,
  ): Promise<InquiryUnreadSummaryResponseDto> {
    const messageRepository = this.dataSource.getRepository(InquiryMessage);

    const queryBuilder = messageRepository
      .createQueryBuilder('message')
      .innerJoin('message.inquiry', 'inquiry')
      .leftJoin(
        'inquiry_read_status',
        'read_status',
        'read_status.inquiry_id = inquiry.inquiryId AND read_status.user_id = :userId',
        {
          userId: user.userId,
        },
      )
      .select('inquiry.inquiryId', 'inquiryId')
      .addSelect('COUNT(message.messageId)', 'unreadCount')
      .addSelect('MAX(message.createdAt)', 'latestUnreadMessageAt')
      .where('message.type = :messageType', {
        messageType: InquiryMessageType.MESSAGE,
      })
      .andWhere('message.senderUserId IS NOT NULL')
      .andWhere('message.senderUserId != :userId', {
        userId: user.userId,
      })
      .andWhere(
        '(read_status.inquiry_read_status_id IS NULL OR message.createdAt > read_status.last_read_at)',
      );

    // ケアマネは自分が作成した問い合わせのみ
    if (user.role === UserRole.CARE_MANAGER) {
      queryBuilder.andWhere('inquiry.createdByUserId = :createdByUserId', {
        createdByUserId: user.userId,
      });
    }

    // 施設職員はACTIVEで所属している施設宛のみ
    else if (user.role === UserRole.FACILITY) {
      const facilityIds = await this.getActiveFacilityIds(
        user.userId,
        this.dataSource.manager,
      );

      if (facilityIds.length === 0) {
        throw new ForbiddenException('No active facility assignment found');
      }

      queryBuilder.andWhere('inquiry.facilityId IN (:...facilityIds)', {
        facilityIds,
      });
    }

    // ADMINは全問い合わせを対象とする
    else if (user.role !== UserRole.ADMIN) {
      throw new ForbiddenException('You are not allowed to access inquiries');
    }

    const rows = await queryBuilder
      .groupBy('inquiry.inquiryId')
      .orderBy('MAX(message.createdAt)', 'DESC')
      .getRawMany<{
        inquiryId: string;
        unreadCount: string;
        latestUnreadMessageAt: Date | string;
      }>();

    const inquiries = rows.map((row) => ({
      inquiryId: row.inquiryId,
      unreadCount: Number(row.unreadCount),
      latestUnreadMessageAt: new Date(row.latestUnreadMessageAt),
    }));

    return {
      totalUnreadCount: inquiries.reduce(
        (total, inquiry) => total + inquiry.unreadCount,
        0,
      ),
      unreadInquiryCount: inquiries.length,
      inquiries,
    };
  }

  /**
   * 問い合わせを指定メッセージまで既読にする。
   *
   * クライアントが実際に表示した最後のメッセージの
   * createdAt を既読位置として保存する。
   */
  async markAsRead(
    inquiryId: string,
    dto: MarkInquiryReadDto,
    user: AuthenticatedUser,
  ): Promise<void> {
    await this.dataSource.transaction(async (manager) => {
      const inquiryRepository = manager.getRepository(Inquiry);
      const messageRepository = manager.getRepository(InquiryMessage);
      const readStatusRepository = manager.getRepository(InquiryReadStatus);

      // 問い合わせの存在確認
      const inquiry = await inquiryRepository.findOne({
        where: {
          inquiryId,
        },
      });

      if (!inquiry) {
        throw new NotFoundException('Inquiry not found');
      }

      // 既存の問い合わせ認可をそのまま利用する
      await this.assertInquiryAccess(inquiry, user, manager);

      // 画面上で確認した最後のメッセージを取得する
      const message = await messageRepository.findOne({
        where: {
          messageId: dto.messageId,
          inquiryId,
        },
      });

      if (!message) {
        throw new NotFoundException('Inquiry message not found');
      }

      // Inquiry × User 単位の既読状態を取得する
      const existingReadStatus = await readStatusRepository.findOne({
        where: {
          inquiryId,
          userId: user.userId,
        },
      });

      if (existingReadStatus) {
        /**
         * 古い画面や遅延したリクエストによって
         * 既読位置が過去へ戻ることを防ぐ。
         */
        if (message.createdAt > existingReadStatus.lastReadAt) {
          existingReadStatus.lastReadAt = message.createdAt;
          await readStatusRepository.save(existingReadStatus);
        }

        return;
      }

      // 初回既読
      const readStatus = readStatusRepository.create({
        inquiryId,
        userId: user.userId,
        lastReadAt: message.createdAt,
      });

      await readStatusRepository.save(readStatus);
    });
  }

  private async getActiveFacilityIds(
    userId: string,
    manager: EntityManager,
  ): Promise<string[]> {
    const facilityStaffRepository = manager.getRepository(FacilityStaff);

    const facilityStaffList = await facilityStaffRepository.find({
      where: {
        userId,
        status: FacilityStaffStatus.ACTIVE,
      },
    });

    return facilityStaffList.map((facilityStaff) => facilityStaff.facilityId);
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
      inquiry.createdByUserId === user.userId
    ) {
      return;
    }

    // FACILITYは所属施設宛のみ
    if (user.role === UserRole.FACILITY) {
      const facilityStaffRepository = manager.getRepository(FacilityStaff);

      const facilityStaff = await facilityStaffRepository.findOne({
        where: {
          userId: user.userId,
          facilityId: inquiry.facilityId,
          status: FacilityStaffStatus.ACTIVE,
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
