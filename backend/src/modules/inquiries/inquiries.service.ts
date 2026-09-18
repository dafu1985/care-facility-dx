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

@Injectable()
export class InquiriesService {
  constructor(private readonly dataSource: DataSource) {}

  /**
   * 蝠上＞蜷医ｏ縺帑ｽ懈・
   *
   * CARE_MANAGER:
   * 閾ｪ蛻・・霄ｫ縺ｮ繝ｦ繝ｼ繧ｶ繝ｼID縺ｧ蝠上＞蜷医ｏ縺帙ｒ菴懈・縺吶ｋ縲・
   *
   * ADMIN:
   * 邂｡逅・畑騾斐→縺励※菴懈・蜿ｯ閭ｽ縲・
   *
   * FACILITY:
   * 蝠上＞蜷医ｏ縺帙・譁ｰ隕丈ｽ懈・縺ｯ荳榊庄縲・
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
   * 蝠上＞蜷医ｏ縺帑ｸ隕ｧ蜿門ｾ・
   *
   * CARE_MANAGER:
   * 閾ｪ蛻・′菴懈・縺励◆蝠上＞蜷医ｏ縺帙・縺ｿ縲・
   *
   * FACILITY:
   * 閾ｪ蛻・′謇螻槭☆繧区命險ｭ螳帙・蝠上＞蜷医ｏ縺帙・縺ｿ縲・
   *
   * ADMIN:
   * 蜈ｨ蝠上＞蜷医ｏ縺帙・
   */
  async findAll(
    query: InquirySearchDto,
    user: AuthenticatedUser,
  ): Promise<InquiryListResponseDto> {
    const inquiryRepository = this.dataSource.getRepository(Inquiry);

    const queryBuilder = inquiryRepository
      .createQueryBuilder('inquiry')
      .leftJoinAndSelect('inquiry.facility', 'facility');

    // 繧ｱ繧｢繝槭ロ縺ｯ閾ｪ蛻・・蝠上＞蜷医ｏ縺帙・縺ｿ
    if (user.role === UserRole.CARE_MANAGER) {
      queryBuilder.andWhere('inquiry.createdByUserId = :createdByUserId', {
        createdByUserId: user.userId,
      });
    }

    // 譁ｽ險ｭ閨ｷ蜩｡縺ｯ謇螻樊命險ｭ螳帙・縺ｿ
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

    // ADMIN縺ｯ莉ｻ諢上Θ繝ｼ繧ｶ繝ｼ縺ｧ讀懃ｴ｢蜿ｯ閭ｽ
    else if (user.role === UserRole.ADMIN) {
      if (query.createdByUserId) {
        queryBuilder.andWhere('inquiry.createdByUserId = :createdByUserId', {
          createdByUserId: query.createdByUserId,
        });
      }
    }

    // 諠ｳ螳壼､悶Ο繝ｼ繝ｫ
    else {
      throw new ForbiddenException('You are not allowed to access inquiries');
    }

    /**
     * facilityId縺ｫ繧医ｋ霑ｽ蜉讀懃ｴ｢縲・
     *
     * FACILITY縺ｮ蝣ｴ蜷医ｂ縲∽ｸ願ｨ倥・謇螻樊命險ｭ譚｡莉ｶ縺ｨ
     * AND譚｡莉ｶ縺ｫ縺ｪ繧九◆繧∽ｻ匁命險ｭ縺ｯ蜿門ｾ励〒縺阪↑縺・・
     */
    if (query.facilityId) {
      queryBuilder.andWhere('inquiry.facilityId = :facilityId', {
        facilityId: query.facilityId,
      });
    }

    // 繧ｹ繝・・繧ｿ繧ｹ
    if (query.status) {
      queryBuilder.andWhere('inquiry.status = :status', {
        status: query.status,
      });
    }

    // 譛譁ｰ縺ｮ繧・ｊ蜿悶ｊ鬆・
    queryBuilder
      .orderBy('inquiry.lastMessageAt', 'DESC', 'NULLS LAST')
      .addOrderBy('inquiry.createdAt', 'DESC')
      .addOrderBy('inquiry.inquiryId', 'ASC');

    // 繝壹・繧ｸ繝阪・繧ｷ繝ｧ繝ｳ
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
   * 蝠上＞蜷医ｏ縺幄ｩｳ邏ｰ蜿門ｾ・
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
   * 繝｡繝・そ繝ｼ繧ｸ霑ｽ蜉
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
   * 蝠上＞蜷医ｏ縺帙せ繝・・繧ｿ繧ｹ譖ｴ譁ｰ
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
       * 蝠上＞蜷医ｏ縺帙∈縺ｮ繧｢繧ｯ繧ｻ繧ｹ讓ｩ繧堤｢ｺ隱阪☆繧九・
       */
      await this.assertInquiryAccess(inquiry, user, manager);

      /**
       * ロールごとに許可されたステータス遷移か確認する。
       */
      this.assertStatusTransition(inquiry.status, dto.status, user.role);

      /**
       * 迴ｾ蝨ｨ縺ｨ蜷後§繧ｹ繝・・繧ｿ繧ｹ縺梧欠螳壹＆繧後◆蝣ｴ蜷医・縲・
       * Inquiry譖ｴ譁ｰ繝ｻSTATUS_CHANGE螻･豁ｴ菴懈・繧定｡後ｏ縺ｪ縺・・
       */
      if (inquiry.status === dto.status) {
        return;
      }

      /**
       * 螟画峩蜑阪せ繝・・繧ｿ繧ｹ繧剃ｿ晄戟縺吶ｋ縲・
       */
      const previousStatus = inquiry.status;

      /**
       * 蝠上＞蜷医ｏ縺帙せ繝・・繧ｿ繧ｹ繧呈峩譁ｰ縺吶ｋ縲・
       */
      inquiry.status = dto.status;

      const savedInquiry = await inquiryRepository.save(inquiry);

      /**
       * 繧ｹ繝・・繧ｿ繧ｹ螟画峩螻･豁ｴ繧剃ｽ懈・縺吶ｋ縲・
       *
       * SYSTEM謇ｱ縺・・縺溘ａsenderUserId縺ｯnull縲・
       */
      const statusMessage = messageRepository.create({
        inquiryId,
        senderUserId: null,
        type: InquiryMessageType.STATUS_CHANGE,
        body: `Status changed from ` + `${previousStatus} to ${dto.status}`,
      });

      const savedMessage = await messageRepository.save(statusMessage);

      /**
       * 繧ｹ繝・・繧ｿ繧ｹ螟画峩繧ょ撫縺・粋繧上○荳翫・
       * 譛邨ゅい繧ｯ繝・ぅ繝薙ユ繧｣縺ｨ縺励※謇ｱ縺・・
       */
      savedInquiry.lastMessageAt = savedMessage.createdAt;

      await inquiryRepository.save(savedInquiry);
    });

    /**
     * 譛譁ｰ迥ｶ諷九ｒ隧ｳ邏ｰ繝ｬ繧ｹ繝昴Φ繧ｹ縺ｨ縺励※霑斐☆縲・
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
   * 蝠上＞蜷医ｏ縺帙∈縺ｮ繧｢繧ｯ繧ｻ繧ｹ讓ｩ繧堤｢ｺ隱阪☆繧九・
   *
   * CARE_MANAGER:
   * 閾ｪ蛻・′菴懈・縺励◆蝠上＞蜷医ｏ縺帙・縺ｿ縲・
   *
   * FACILITY:
   * 閾ｪ蛻・′ACTIVE迥ｶ諷九〒謇螻槭＠縺ｦ縺・ｋ譁ｽ險ｭ螳帙・縺ｿ縲・
   *
   * ADMIN:
   * 蜈ｨ蝠上＞蜷医ｏ縺帙・
   */
  private async assertInquiryAccess(
    inquiry: Inquiry,
    user: AuthenticatedUser,
    manager: EntityManager,
  ): Promise<void> {
    // ADMIN縺ｯ蜈ｨ蝠上＞蜷医ｏ縺帙∈繧｢繧ｯ繧ｻ繧ｹ蜿ｯ閭ｽ
    if (user.role === UserRole.ADMIN) {
      return;
    }

    // CARE_MANAGER縺ｯ閾ｪ蛻・・蝠上＞蜷医ｏ縺帙・縺ｿ
    if (
      user.role === UserRole.CARE_MANAGER &&
      inquiry.createdByUserId === user.userId
    ) {
      return;
    }

    // FACILITY縺ｯ謇螻樊命險ｭ螳帙・縺ｿ
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
