import { beforeEach, describe, expect, it, jest } from '@jest/globals';
import { ForbiddenException, NotFoundException } from '@nestjs/common';
import {
  DataSource,
  EntityManager,
  FindManyOptions,
  FindOneOptions,
} from 'typeorm';

import type { AuthenticatedUser } from '../auth/jwt.strategy';
import {
  FacilityStaff,
  FacilityStaffRole,
  FacilityStaffStatus,
} from '../facilities/entities/facility-staff.entity';
import { UserRole } from '../users/entities/user.entity';

import { Inquiry, InquiryStatus } from './entities/inquiry.entity';
import { InquiriesService } from './inquiries.service';

import {
  InquiryMessage,
  InquiryMessageType,
} from './entities/inquiry-message.entity';

/**
 * QueryBuilderの必要部分だけを持つテスト用型。
 */
type MockInquiryQueryBuilder = {
  leftJoinAndSelect: ReturnType<typeof jest.fn>;
  where: ReturnType<typeof jest.fn>;
  orderBy: ReturnType<typeof jest.fn>;
  getOne: ReturnType<typeof jest.fn>;
};

/**
 * findAll() 用QueryBuilderのテスト用型。
 */
type MockInquiryListQueryBuilder = {
  leftJoinAndSelect: ReturnType<typeof jest.fn>;

  andWhere: ReturnType<typeof jest.fn>;

  orderBy: ReturnType<typeof jest.fn>;

  addOrderBy: ReturnType<typeof jest.fn>;

  skip: ReturnType<typeof jest.fn>;

  take: ReturnType<typeof jest.fn>;

  getManyAndCount: ReturnType<typeof jest.fn>;
};

describe('InquiriesService authorization', () => {
  let service: InquiriesService;

  /**
   * Inquiry Repository モック。
   */
  const inquiryRepository = {
    createQueryBuilder: jest.fn(),

    findOne: jest.fn<() => Promise<Inquiry | null>>(),

    save: jest.fn<(inquiry: Inquiry) => Promise<Inquiry>>(),
  };

  /**
   * FacilityStaff Repository モック。
   *
   * TypeORM Repository#findOne と同様に
   * FindOneOptionsを引数として受け取る。
   */
  const facilityStaffRepository = {
    findOne:
      jest.fn<
        (
          options: FindOneOptions<FacilityStaff>,
        ) => Promise<FacilityStaff | null>
      >(),

    find: jest.fn<
      (options?: FindManyOptions<FacilityStaff>) => Promise<FacilityStaff[]>
    >(),
  };

  /**
   * InquiryMessage Repository モック。
   */
  const inquiryMessageRepository = {
    create: jest.fn<(message: Partial<InquiryMessage>) => InquiryMessage>(),

    save: jest.fn<(message: InquiryMessage) => Promise<InquiryMessage>>(),
  };

  /**
   * EntityManager モック。
   */
  const manager = {
    getRepository: jest.fn(),
  } as unknown as EntityManager;

  /**
   * DataSource モック。
   */
  const dataSource = {
    getRepository: jest.fn(),

    manager,

    transaction: jest.fn(),
  } as unknown as DataSource;

  /**
   * テスト対象問い合わせ。
   */
  const ownInquiry: Inquiry = {
    inquiryId: '5ddaf599-93c5-40ec-bc1e-ced92540882b',

    facilityId: '5ea06a45-7587-4198-b94c-56e0044399c7',

    createdByUserId: '01541a48-ac15-4279-ac45-166b923f14c9',

    subject: '空き状況について',

    status: InquiryStatus.ANSWERED,

    lastMessageAt: new Date(),

    createdAt: new Date(),

    updatedAt: new Date(),

    messages: [],

    // 今回の認可テストではRelationを使用しないためダミー
    facility: undefined as never,

    createdByUser: undefined as never,
  };

  /**
   * 問い合わせ所有者。
   */
  const careManagerUser: AuthenticatedUser = {
    userId: '01541a48-ac15-4279-ac45-166b923f14c9',

    role: UserRole.CARE_MANAGER,

    email: 'caremanager@example.com',
  };

  /**
   * 別ケアマネ。
   */
  const anotherCareManagerUser: AuthenticatedUser = {
    userId: '127e3b54-7c54-4d4e-b4f2-2b497c3bf51d',

    role: UserRole.CARE_MANAGER,

    email: 'caremanager2@example.com',
  };

  /**
   * 施設職員。
   */
  const facilityUser: AuthenticatedUser = {
    userId: '1acfc687-32f9-4f32-ac40-c91d9286bfa7',

    role: UserRole.FACILITY,

    email: 'facilitystaff@example.com',
  };

  /**
   * 管理者。
   */
  const adminUser: AuthenticatedUser = {
    userId: '99999999-9999-4999-8999-999999999999',

    role: UserRole.ADMIN,

    email: 'admin@example.com',
  };

  beforeEach(() => {
    jest.clearAllMocks();

    service = new InquiriesService(dataSource);

    /**
     * DataSource#getRepository
     */
    jest.spyOn(dataSource, 'getRepository').mockImplementation(((
      entity: unknown,
    ) => {
      if (entity === Inquiry) {
        return inquiryRepository;
      }

      if (entity === FacilityStaff) {
        return facilityStaffRepository;
      }

      return {};
    }) as never);

    /**
     * EntityManager#getRepository
     */
    jest.spyOn(manager, 'getRepository').mockImplementation(((
      entity: unknown,
    ) => {
      if (entity === Inquiry) {
        return inquiryRepository;
      }

      if (entity === InquiryMessage) {
        return inquiryMessageRepository;
      }

      if (entity === FacilityStaff) {
        return facilityStaffRepository;
      }

      return {};
    }) as never);

    /**
     * transaction(callback) をそのまま
     * テスト用EntityManagerで実行する。
     */
    jest.spyOn(dataSource, 'transaction').mockImplementation((async (
      callback: (manager: EntityManager) => Promise<unknown>,
    ) => {
      return callback(manager);
    }) as never);
  });

  /**
   * findOne()用QueryBuilderを生成する。
   */
  const mockFindOneQueryBuilder = (
    inquiry: Inquiry | null,
  ): MockInquiryQueryBuilder => {
    const queryBuilder = {
      leftJoinAndSelect: jest.fn().mockReturnThis(),

      where: jest.fn().mockReturnThis(),

      orderBy: jest.fn().mockReturnThis(),

      getOne: jest
        .fn<() => Promise<Inquiry | null>>()
        .mockResolvedValue(inquiry),
    };

    inquiryRepository.createQueryBuilder.mockReturnValue(queryBuilder);

    return queryBuilder;
  };

  /**
   * findAll() 用QueryBuilderを生成する。
   */
  const mockFindAllQueryBuilder = (
    inquiries: Inquiry[],
    total: number,
  ): MockInquiryListQueryBuilder => {
    const queryBuilder = {
      leftJoinAndSelect: jest.fn().mockReturnThis(),

      andWhere: jest.fn().mockReturnThis(),

      orderBy: jest.fn().mockReturnThis(),

      addOrderBy: jest.fn().mockReturnThis(),

      skip: jest.fn().mockReturnThis(),

      take: jest.fn().mockReturnThis(),

      getManyAndCount: jest
        .fn<() => Promise<[Inquiry[], number]>>()
        .mockResolvedValue([inquiries, total]),
    };

    inquiryRepository.createQueryBuilder.mockReturnValue(queryBuilder);

    return queryBuilder;
  };

  describe('CARE_MANAGER', () => {
    it('自分が作成した問い合わせは取得できる', async () => {
      mockFindOneQueryBuilder(ownInquiry);

      const result = await service.findOne(
        ownInquiry.inquiryId,
        careManagerUser,
      );

      expect(result.inquiryId).toBe(ownInquiry.inquiryId);

      expect(result.createdByUserId).toBe(careManagerUser.userId);
    });

    it('他人が作成した問い合わせは403になる', async () => {
      mockFindOneQueryBuilder(ownInquiry);

      await expect(
        service.findOne(ownInquiry.inquiryId, anotherCareManagerUser),
      ).rejects.toBeInstanceOf(ForbiddenException);
    });
  });

  describe('FACILITY', () => {
    it('自施設宛の問い合わせは取得できる', async () => {
      mockFindOneQueryBuilder(ownInquiry);

      facilityStaffRepository.findOne.mockResolvedValue({
        facilityStaffId: '11111111-1111-4111-8111-111111111111',

        userId: facilityUser.userId,

        facilityId: ownInquiry.facilityId,

        role: FacilityStaffRole.MANAGER,

        status: FacilityStaffStatus.ACTIVE,

        createdAt: new Date(),

        updatedAt: new Date(),

        // Relationは今回のテストでは使用しないためダミー
        user: undefined as never,

        facility: undefined as never,
      });

      const result = await service.findOne(ownInquiry.inquiryId, facilityUser);

      expect(result.inquiryId).toBe(ownInquiry.inquiryId);

      expect(facilityStaffRepository.findOne).toHaveBeenCalledWith({
        where: {
          userId: facilityUser.userId,

          facilityId: ownInquiry.facilityId,

          status: FacilityStaffStatus.ACTIVE,
        },
      });
    });

    it('他施設宛の問い合わせは403になる', async () => {
      mockFindOneQueryBuilder(ownInquiry);

      facilityStaffRepository.findOne.mockResolvedValue(null);

      await expect(
        service.findOne(ownInquiry.inquiryId, facilityUser),
      ).rejects.toBeInstanceOf(ForbiddenException);
    });
  });

  describe('ADMIN', () => {
    it('全問い合わせを取得できる', async () => {
      mockFindOneQueryBuilder(ownInquiry);

      const result = await service.findOne(ownInquiry.inquiryId, adminUser);

      expect(result.inquiryId).toBe(ownInquiry.inquiryId);

      expect(facilityStaffRepository.findOne).not.toHaveBeenCalled();
    });
  });

  describe('findOne not found', () => {
    it('存在しない問い合わせは404になる', async () => {
      // QueryBuilderから問い合わせが取得できない状態を再現
      mockFindOneQueryBuilder(null);

      await expect(
        service.findOne(
          'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa',
          careManagerUser,
        ),
      ).rejects.toBeInstanceOf(NotFoundException);

      // 問い合わせ自体が存在しないため、
      // 施設所属確認まで進まない
      expect(facilityStaffRepository.findOne).not.toHaveBeenCalled();
    });
  });

  describe('findAll authorization', () => {
    it('CARE_MANAGERは自分の問い合わせだけに絞り込む', async () => {
      const queryBuilder = mockFindAllQueryBuilder([ownInquiry], 1);

      const result = await service.findAll(
        {
          page: 1,
          pageSize: 20,
        },
        careManagerUser,
      );

      expect(queryBuilder.andWhere).toHaveBeenCalledWith(
        'inquiry.createdByUserId = :createdByUserId',
        {
          createdByUserId: careManagerUser.userId,
        },
      );

      expect(result.total).toBe(1);

      expect(result.items).toHaveLength(1);
    });

    it('FACILITYは所属施設宛の問い合わせだけに絞り込む', async () => {
      facilityStaffRepository.find.mockResolvedValue([
        {
          facilityStaffId: '11111111-1111-4111-8111-111111111111',

          userId: facilityUser.userId,

          facilityId: ownInquiry.facilityId,

          role: FacilityStaffRole.MANAGER,

          status: FacilityStaffStatus.ACTIVE,

          createdAt: new Date(),

          updatedAt: new Date(),

          user: undefined as never,

          facility: undefined as never,
        },
      ]);

      const queryBuilder = mockFindAllQueryBuilder([ownInquiry], 1);

      const result = await service.findAll(
        {
          page: 1,
          pageSize: 20,
        },
        facilityUser,
      );

      expect(facilityStaffRepository.find).toHaveBeenCalledWith({
        where: {
          userId: facilityUser.userId,
          status: FacilityStaffStatus.ACTIVE,
        },
      });

      expect(queryBuilder.andWhere).toHaveBeenCalledWith(
        'inquiry.facilityId IN (:...facilityIds)',
        {
          facilityIds: [ownInquiry.facilityId],
        },
      );

      expect(result.total).toBe(1);

      expect(result.items).toHaveLength(1);
    });

    it('所属施設がないFACILITYは403になる', async () => {
      facilityStaffRepository.find.mockResolvedValue([]);

      mockFindAllQueryBuilder([], 0);

      await expect(
        service.findAll(
          {
            page: 1,
            pageSize: 20,
          },
          facilityUser,
        ),
      ).rejects.toBeInstanceOf(ForbiddenException);
    });

    it('ADMINは所有者制限なしで一覧取得できる', async () => {
      const queryBuilder = mockFindAllQueryBuilder([ownInquiry], 1);

      const result = await service.findAll(
        {
          page: 1,
          pageSize: 20,
        },
        adminUser,
      );

      expect(queryBuilder.andWhere).not.toHaveBeenCalledWith(
        'inquiry.createdByUserId = :createdByUserId',
        expect.anything(),
      );

      expect(result.total).toBe(1);
    });

    it('問い合わせ一覧に施設名を返す', async () => {
      const inquiryWithFacility: Inquiry = {
        ...ownInquiry,

        facility: {
          facilityId: ownInquiry.facilityId,

          name: 'ハタケヤマ介護ホーム新潟',
        } as never,
      };

      mockFindAllQueryBuilder([inquiryWithFacility], 1);

      const result = await service.findAll(
        {
          page: 1,
          pageSize: 20,
        },
        adminUser,
      );

      expect(result.items[0]).toEqual(
        expect.objectContaining({
          facilityId: ownInquiry.facilityId,

          facilityName: 'ハタケヤマ介護ホーム新潟',
        }),
      );
    });
  });

  describe('addMessage authorization', () => {
    const createMessageDto = {
      body: '施設側からの返信テストです。',
    };

    /**
     * addMessage成功用の共通モック。
     */
    const setupAddMessageSuccess = (senderUserId: string) => {
      inquiryRepository.findOne.mockResolvedValue(ownInquiry);

      const savedMessage: InquiryMessage = {
        messageId: '22222222-2222-4222-8222-222222222222',

        inquiryId: ownInquiry.inquiryId,

        senderUserId,

        type: InquiryMessageType.MESSAGE,

        body: createMessageDto.body,

        createdAt: new Date(),

        inquiry: undefined as never,

        senderUser: undefined as never,
      };

      inquiryMessageRepository.create.mockReturnValue(savedMessage);

      inquiryMessageRepository.save.mockResolvedValue(savedMessage);

      inquiryRepository.save.mockResolvedValue(ownInquiry);

      return savedMessage;
    };

    it('CARE_MANAGERは自分の問い合わせへ返信できる', async () => {
      const savedMessage = setupAddMessageSuccess(careManagerUser.userId);

      const result = await service.addMessage(
        ownInquiry.inquiryId,
        createMessageDto,
        careManagerUser,
      );

      expect(result.messageId).toBe(savedMessage.messageId);

      expect(inquiryMessageRepository.create).toHaveBeenCalledWith({
        inquiryId: ownInquiry.inquiryId,
        senderUserId: careManagerUser.userId,
        type: InquiryMessageType.MESSAGE,
        body: createMessageDto.body,
      });
    });

    it('CARE_MANAGERは他人の問い合わせへ返信できない', async () => {
      inquiryRepository.findOne.mockResolvedValue(ownInquiry);

      await expect(
        service.addMessage(
          ownInquiry.inquiryId,
          createMessageDto,
          anotherCareManagerUser,
        ),
      ).rejects.toBeInstanceOf(ForbiddenException);

      expect(inquiryMessageRepository.save).not.toHaveBeenCalled();
    });

    it('FACILITYは自施設宛の問い合わせへ返信できる', async () => {
      const savedMessage = setupAddMessageSuccess(facilityUser.userId);

      facilityStaffRepository.findOne.mockResolvedValue({
        facilityStaffId: '11111111-1111-4111-8111-111111111111',
        userId: facilityUser.userId,
        facilityId: ownInquiry.facilityId,
        role: FacilityStaffRole.MANAGER,
        status: FacilityStaffStatus.ACTIVE,
        createdAt: new Date(),
        updatedAt: new Date(),
        user: undefined as never,
        facility: undefined as never,
      });

      const result = await service.addMessage(
        ownInquiry.inquiryId,
        createMessageDto,
        facilityUser,
      );

      expect(result.messageId).toBe(savedMessage.messageId);

      expect(inquiryMessageRepository.create).toHaveBeenCalledWith({
        inquiryId: ownInquiry.inquiryId,
        senderUserId: facilityUser.userId,
        type: InquiryMessageType.MESSAGE,
        body: createMessageDto.body,
      });
    });

    it('FACILITYは他施設宛の問い合わせへ返信できない', async () => {
      inquiryRepository.findOne.mockResolvedValue(ownInquiry);

      facilityStaffRepository.findOne.mockResolvedValue(null);

      await expect(
        service.addMessage(
          ownInquiry.inquiryId,
          createMessageDto,
          facilityUser,
        ),
      ).rejects.toBeInstanceOf(ForbiddenException);

      expect(inquiryMessageRepository.save).not.toHaveBeenCalled();
    });

    it('存在しない問い合わせへの返信は404になる', async () => {
      // transaction内のfindOneで
      // 問い合わせが見つからない状態を再現
      inquiryRepository.findOne.mockResolvedValue(null);

      await expect(
        service.addMessage(
          'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa',
          createMessageDto,
          careManagerUser,
        ),
      ).rejects.toBeInstanceOf(NotFoundException);

      // 問い合わせが存在しないため、
      // メッセージ作成・保存は実行されない
      expect(inquiryMessageRepository.create).not.toHaveBeenCalled();

      expect(inquiryMessageRepository.save).not.toHaveBeenCalled();

      // Inquiryの更新もされない
      expect(inquiryRepository.save).not.toHaveBeenCalled();
    });

    it('メッセージ追加成功時にlastMessageAtが保存メッセージ日時へ更新される', async () => {
      const savedMessage = setupAddMessageSuccess(careManagerUser.userId);

      await service.addMessage(
        ownInquiry.inquiryId,
        createMessageDto,
        careManagerUser,
      );

      expect(ownInquiry.lastMessageAt).toEqual(savedMessage.createdAt);
    });

    it('メッセージ追加成功時に更新済みInquiryが保存される', async () => {
      const savedMessage = setupAddMessageSuccess(careManagerUser.userId);

      await service.addMessage(
        ownInquiry.inquiryId,
        createMessageDto,
        careManagerUser,
      );

      expect(inquiryRepository.save).toHaveBeenCalledWith(
        expect.objectContaining({
          inquiryId: ownInquiry.inquiryId,
          lastMessageAt: savedMessage.createdAt,
        }),
      );
    });
  });

  describe('updateStatus authorization', () => {
    const updateStatusDto = {
      status: InquiryStatus.ANSWERED,
    };

    /**
     * updateStatus成功用の共通モック。
     *
     * OPEN → ANSWERED の実際のステータス変更を再現する。
     */
    const setupUpdateStatusSuccess = () => {
      const inquiryBeforeUpdate: Inquiry = {
        ...ownInquiry,
        status: InquiryStatus.OPEN,
      };

      inquiryRepository.findOne.mockResolvedValue(inquiryBeforeUpdate);

      inquiryRepository.save.mockImplementation(
        async (inquiry: Inquiry) => inquiry,
      );

      const statusMessage: InquiryMessage = {
        messageId: '33333333-3333-4333-8333-333333333333',

        inquiryId: inquiryBeforeUpdate.inquiryId,

        senderUserId: null,

        type: InquiryMessageType.STATUS_CHANGE,

        body: 'Status changed from OPEN to ANSWERED',

        createdAt: new Date(),

        inquiry: undefined as never,

        senderUser: null,
      };

      inquiryMessageRepository.create.mockReturnValue(statusMessage);

      inquiryMessageRepository.save.mockResolvedValue(statusMessage);

      /**
       * updateStatus()最後のfindOne()では、
       * 更新後のANSWERED状態を返す。
       */
      mockFindOneQueryBuilder({
        ...inquiryBeforeUpdate,
        status: InquiryStatus.ANSWERED,
      });

      return {
        inquiryBeforeUpdate,
        statusMessage,
      };
    };

    it('FACILITYは自施設宛のステータスを更新できる', async () => {
      const { inquiryBeforeUpdate } = setupUpdateStatusSuccess();

      facilityStaffRepository.findOne.mockResolvedValue({
        facilityStaffId: '11111111-1111-4111-8111-111111111111',

        userId: facilityUser.userId,

        facilityId: inquiryBeforeUpdate.facilityId,

        role: FacilityStaffRole.MANAGER,

        status: FacilityStaffStatus.ACTIVE,

        createdAt: new Date(),

        updatedAt: new Date(),

        user: undefined as never,

        facility: undefined as never,
      });

      const result = await service.updateStatus(
        inquiryBeforeUpdate.inquiryId,
        updateStatusDto,
        facilityUser,
      );

      expect(result.status).toBe(InquiryStatus.ANSWERED);

      expect(inquiryMessageRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({
          inquiryId: inquiryBeforeUpdate.inquiryId,

          senderUserId: null,

          type: InquiryMessageType.STATUS_CHANGE,
        }),
      );
    });

    it('FACILITYは他施設宛のステータスを更新できない', async () => {
      const inquiryBeforeUpdate: Inquiry = {
        ...ownInquiry,
        status: InquiryStatus.OPEN,
      };

      inquiryRepository.findOne.mockResolvedValue(inquiryBeforeUpdate);

      facilityStaffRepository.findOne.mockResolvedValue(null);

      await expect(
        service.updateStatus(
          inquiryBeforeUpdate.inquiryId,
          updateStatusDto,
          facilityUser,
        ),
      ).rejects.toBeInstanceOf(ForbiddenException);

      expect(inquiryMessageRepository.save).not.toHaveBeenCalled();
    });

    it('ADMINは問い合わせステータスを更新できる', async () => {
      const { inquiryBeforeUpdate } = setupUpdateStatusSuccess();

      const result = await service.updateStatus(
        inquiryBeforeUpdate.inquiryId,
        updateStatusDto,
        adminUser,
      );

      expect(result.status).toBe(InquiryStatus.ANSWERED);

      expect(facilityStaffRepository.findOne).not.toHaveBeenCalled();
    });

    it('存在しない問い合わせのステータス更新は404になる', async () => {
      /**
       * transaction内で問い合わせが
       * 見つからない状態を再現する。
       */
      inquiryRepository.findOne.mockResolvedValue(null);

      await expect(
        service.updateStatus(
          'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa',
          updateStatusDto,
          adminUser,
        ),
      ).rejects.toBeInstanceOf(NotFoundException);

      /**
       * 問い合わせが存在しないため、
       * ステータス変更履歴は生成されない。
       */
      expect(inquiryMessageRepository.create).not.toHaveBeenCalled();

      expect(inquiryMessageRepository.save).not.toHaveBeenCalled();

      /**
       * Inquiry自体も更新されない。
       */
      expect(inquiryRepository.save).not.toHaveBeenCalled();
    });

    it('ステータス更新成功時にSTATUS_CHANGE本文へ変更前後のステータスが記録される', async () => {
      const inquiryBeforeUpdate: Inquiry = {
        ...ownInquiry,
        status: InquiryStatus.OPEN,
      };

      inquiryRepository.findOne.mockResolvedValue(inquiryBeforeUpdate);

      inquiryRepository.save.mockImplementation(
        async (inquiry: Inquiry) => inquiry,
      );

      const statusMessage: InquiryMessage = {
        messageId: '44444444-4444-4444-8444-444444444444',

        inquiryId: inquiryBeforeUpdate.inquiryId,

        senderUserId: null,

        type: InquiryMessageType.STATUS_CHANGE,

        body: 'Status changed from OPEN to ANSWERED',

        createdAt: new Date(),

        inquiry: undefined as never,

        senderUser: null,
      };

      inquiryMessageRepository.create.mockReturnValue(statusMessage);

      inquiryMessageRepository.save.mockResolvedValue(statusMessage);

      mockFindOneQueryBuilder({
        ...inquiryBeforeUpdate,
        status: InquiryStatus.ANSWERED,
      });

      await service.updateStatus(
        inquiryBeforeUpdate.inquiryId,
        updateStatusDto,
        adminUser,
      );

      expect(inquiryMessageRepository.create).toHaveBeenCalledWith({
        inquiryId: inquiryBeforeUpdate.inquiryId,

        senderUserId: null,

        type: InquiryMessageType.STATUS_CHANGE,

        body: 'Status changed from OPEN to ANSWERED',
      });
    });

    it('ステータス更新成功時にlastMessageAtがSTATUS_CHANGEメッセージ日時へ更新される', async () => {
      const { inquiryBeforeUpdate, statusMessage } = setupUpdateStatusSuccess();

      await service.updateStatus(
        inquiryBeforeUpdate.inquiryId,
        updateStatusDto,
        adminUser,
      );

      expect(inquiryBeforeUpdate.lastMessageAt).toEqual(
        statusMessage.createdAt,
      );

      expect(inquiryRepository.save).toHaveBeenCalledWith(
        expect.objectContaining({
          inquiryId: inquiryBeforeUpdate.inquiryId,

          lastMessageAt: statusMessage.createdAt,
        }),
      );
    });

    it('同じステータスへの更新ではSTATUS_CHANGEを作成しない', async () => {
      /**
       * 現在のステータスと更新後ステータスを
       * どちらもANSWEREDにする。
       */
      const sameStatusInquiry: Inquiry = {
        ...ownInquiry,
        status: InquiryStatus.ANSWERED,
      };

      inquiryRepository.findOne.mockResolvedValue(sameStatusInquiry);

      /**
       * transaction終了後に
       * updateStatus()からfindOne()が呼ばれるため、
       * 詳細取得用QueryBuilderを準備する。
       */
      mockFindOneQueryBuilder(sameStatusInquiry);

      const result = await service.updateStatus(
        sameStatusInquiry.inquiryId,
        {
          status: InquiryStatus.ANSWERED,
        },
        adminUser,
      );

      /**
       * ステータスはそのままANSWERED。
       */
      expect(result.status).toBe(InquiryStatus.ANSWERED);

      /**
       * 同一ステータスなので
       * Inquiry自体を保存しない。
       */
      expect(inquiryRepository.save).not.toHaveBeenCalled();

      /**
       * STATUS_CHANGEメッセージも
       * 作成・保存しない。
       */
      expect(inquiryMessageRepository.create).not.toHaveBeenCalled();

      expect(inquiryMessageRepository.save).not.toHaveBeenCalled();
    });
  });
});
