import { beforeEach, describe, expect, it, jest } from '@jest/globals';
import { NotFoundException } from '@nestjs/common';
import type { FindManyOptions, FindOneOptions } from 'typeorm';

import { Inquiry, InquiryStatus } from '../inquiries/entities/inquiry.entity';

import { CareManager } from './entities/care-manager.entity';
import { CareManagersService } from './care-managers.service';

describe('CareManagersService', () => {
  let service: CareManagersService;

  /**
   * CareManager Repositoryモック。
   */
  const careManagerRepository = {
    findOne:
      jest.fn<
        (options: FindOneOptions<CareManager>) => Promise<CareManager | null>
      >(),
  };

  /**
   * Inquiry Repositoryモック。
   */
  const inquiryRepository = {
    find: jest.fn<(options?: FindManyOptions<Inquiry>) => Promise<Inquiry[]>>(),
  };

  /**
   * テスト対象ケアマネジャー。
   */
  const careManager: CareManager = {
    userId: '01541a48-ac15-4279-ac45-166b923f14c9',

    organizationName: 'サンプル居宅介護支援事業所',

    licenseNumber: 'CM-DEMO-001',

    createdAt: new Date('2026-09-01T00:00:00.000Z'),

    updatedAt: new Date('2026-09-01T00:00:00.000Z'),

    user: undefined as never,
  };

  /**
   * 問い合わせデータ。
   */
  const inquiries: Inquiry[] = [
    {
      inquiryId: '11111111-1111-4111-8111-111111111111',

      facilityId: 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa',

      createdByUserId: careManager.userId,

      subject: '空床状況について',

      status: InquiryStatus.OPEN,

      lastMessageAt: new Date('2026-09-10T01:00:00.000Z'),

      createdAt: new Date('2026-09-10T00:00:00.000Z'),

      updatedAt: new Date('2026-09-10T01:00:00.000Z'),

      facility: {
        name: 'サンプル介護ホームA',
      } as never,

      createdByUser: undefined as never,

      messages: [],
    },

    {
      inquiryId: '22222222-2222-4222-8222-222222222222',

      facilityId: 'bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb',

      createdByUserId: careManager.userId,

      subject: '入居条件について',

      status: InquiryStatus.IN_PROGRESS,

      lastMessageAt: new Date('2026-09-09T01:00:00.000Z'),

      createdAt: new Date('2026-09-09T00:00:00.000Z'),

      updatedAt: new Date('2026-09-09T01:00:00.000Z'),

      facility: {
        name: 'サンプル介護ホームB',
      } as never,

      createdByUser: undefined as never,

      messages: [],
    },

    {
      inquiryId: '33333333-3333-4333-8333-333333333333',

      facilityId: 'cccccccc-cccc-4ccc-8ccc-cccccccccccc',

      createdByUserId: careManager.userId,

      subject: '料金について',

      status: InquiryStatus.ANSWERED,

      lastMessageAt: new Date('2026-09-08T01:00:00.000Z'),

      createdAt: new Date('2026-09-08T00:00:00.000Z'),

      updatedAt: new Date('2026-09-08T01:00:00.000Z'),

      facility: {
        name: 'サンプル介護ホームC',
      } as never,

      createdByUser: undefined as never,

      messages: [],
    },
  ];

  beforeEach(() => {
    jest.clearAllMocks();

    service = new CareManagersService(
      careManagerRepository as never,
      inquiryRepository as never,
    );
  });

  describe('getDashboard', () => {
    it('ケアマネジャーダッシュボードを取得できる', async () => {
      careManagerRepository.findOne.mockResolvedValue(careManager);

      inquiryRepository.find.mockResolvedValue(inquiries);

      const result = await service.getDashboard(careManager.userId);

      expect(result).toEqual({
        careManager: {
          userId: careManager.userId,

          organizationName: 'サンプル居宅介護支援事業所',

          licenseNumber: 'CM-DEMO-001',
        },

        inquirySummary: {
          totalCount: 3,

          openCount: 2,

          answeredCount: 1,

          recentInquiries: [
            {
              inquiryId: '11111111-1111-4111-8111-111111111111',

              subject: '空床状況について',

              status: InquiryStatus.OPEN,

              facilityId: 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa',

              facilityName: 'サンプル介護ホームA',

              lastMessageAt: '2026-09-10T01:00:00.000Z',

              createdAt: '2026-09-10T00:00:00.000Z',
            },

            {
              inquiryId: '22222222-2222-4222-8222-222222222222',

              subject: '入居条件について',

              status: InquiryStatus.IN_PROGRESS,

              facilityId: 'bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb',

              facilityName: 'サンプル介護ホームB',

              lastMessageAt: '2026-09-09T01:00:00.000Z',

              createdAt: '2026-09-09T00:00:00.000Z',
            },

            {
              inquiryId: '33333333-3333-4333-8333-333333333333',

              subject: '料金について',

              status: InquiryStatus.ANSWERED,

              facilityId: 'cccccccc-cccc-4ccc-8ccc-cccccccccccc',

              facilityName: 'サンプル介護ホームC',

              lastMessageAt: '2026-09-08T01:00:00.000Z',

              createdAt: '2026-09-08T00:00:00.000Z',
            },
          ],
        },
      });

      expect(careManagerRepository.findOne).toHaveBeenCalledWith({
        where: {
          userId: careManager.userId,
        },
      });

      expect(inquiryRepository.find).toHaveBeenCalledWith({
        where: {
          createdByUserId: careManager.userId,
        },

        relations: {
          facility: true,
        },

        order: {
          createdAt: 'DESC',
        },
      });
    });

    it('ケアマネジャー情報が存在しない場合はNotFoundExceptionを投げる', async () => {
      careManagerRepository.findOne.mockResolvedValue(null);

      await expect(
        service.getDashboard(careManager.userId),
      ).rejects.toBeInstanceOf(NotFoundException);

      expect(inquiryRepository.find).not.toHaveBeenCalled();
    });
  });
});
