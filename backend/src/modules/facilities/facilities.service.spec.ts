import { beforeEach, describe, expect, it, jest } from '@jest/globals';
import {
  BadRequestException,
  ForbiddenException,
  NotFoundException,
} from '@nestjs/common';
import type { FindOneOptions, Repository } from 'typeorm';

import type { AuthenticatedUser } from '../auth/jwt.strategy';
import { UserRole } from '../users/entities/user.entity';

import {
  AvailabilityStatus,
  FacilityAvailability,
} from './entities/facility-availability.entity';
import {
  FacilityStaff,
  FacilityStaffRole,
  FacilityStaffStatus,
} from './entities/facility-staff.entity';
import { Facility } from './entities/facility.entity';
import { FacilityRequirement } from './entities/facility-requirement.entity';

import { FacilitiesService } from './facilities.service';

import { FacilityPricing } from './entities/facility-pricing.entity';
import type { FacilityResponseDto } from './dto/facility-response.dto';

describe('FacilitiesService updateAvailability', () => {
  let service: FacilitiesService;

  /**
   * Facility Repository モック。
   *
   * 実際のRepository#findOneと同様に、
   * FindOneOptionsを引数として受け取れるようにする。
   */
  const facilityRepository = {
    findOne:
      jest.fn<
        (options: FindOneOptions<Facility>) => Promise<Facility | null>
      >(),

    save: jest.fn<(facility: Facility) => Promise<Facility>>(),
  };

  /**
   * FacilityAvailability Repository モック。
   */
  const facilityAvailabilityRepository = {
    findOne:
      jest.fn<
        (
          options: FindOneOptions<FacilityAvailability>,
        ) => Promise<FacilityAvailability | null>
      >(),

    create:
      jest.fn<(input: Partial<FacilityAvailability>) => FacilityAvailability>(),

    save: jest.fn<
      (availability: FacilityAvailability) => Promise<FacilityAvailability>
    >(),
  };

  /**
   * FacilityStaff Repository モック。
   */
  const facilityStaffRepository = {
    findOne:
      jest.fn<
        (
          options: FindOneOptions<FacilityStaff>,
        ) => Promise<FacilityStaff | null>
      >(),
  };

  /**
   * FacilityRequirement Repository モック。
   */
  const facilityRequirementRepository = {
    findOne:
      jest.fn<
        (
          options: FindOneOptions<FacilityRequirement>,
        ) => Promise<FacilityRequirement | null>
      >(),

    create:
      jest.fn<(input: Partial<FacilityRequirement>) => FacilityRequirement>(),

    save: jest.fn<
      (requirement: FacilityRequirement) => Promise<FacilityRequirement>
    >(),
  };

  /**
   * FacilityPricing Repository モック。
   */
  const facilityPricingRepository = {
    findOne:
      jest.fn<
        (
          options: FindOneOptions<FacilityPricing>,
        ) => Promise<FacilityPricing | null>
      >(),

    create: jest.fn<(input: Partial<FacilityPricing>) => FacilityPricing>(),

    save: jest.fn<(pricing: FacilityPricing) => Promise<FacilityPricing>>(),
  };

  /**
   * テスト用Facilityを生成する。
   *
   * 今回のupdateAvailability()では
   * facilityIdしか実質利用しないため、
   * Entity全Relationを無理に生成しない。
   */
  const createFacility = (): Facility =>
    ({
      facilityId: '5ea06a45-7587-4198-b94c-56e0044399c7',

      facilityTypeId: '11111111-1111-4111-8111-111111111111',

      name: 'サンプル介護ホーム',

      postalCode: null,

      address: null,

      area: '新潟市',

      phone: null,

      description: null,

      status: 'ACTIVE',

      createdAt: new Date(),

      updatedAt: new Date(),

      facilityType: undefined,

      availability: undefined,

      pricing: undefined,

      requirement: undefined,
    }) as unknown as Facility;

  /**
   * テスト用空き状況を生成する。
   *
   * 毎回新しいオブジェクトを生成し、
   * Serviceによる破壊的変更が
   * 他テストへ影響しないようにする。
   */
  const createAvailability = (): FacilityAvailability =>
    ({
      availabilityId: '7e74b67e-4300-43af-b676-e9f69a64d259',

      facilityId: '5ea06a45-7587-4198-b94c-56e0044399c7',

      status: AvailabilityStatus.FEW,

      availableCount: 1,

      availableFrom: '2026-09-20',

      note: '残り1床',

      createdAt: new Date(),

      updatedAt: new Date(),

      facility: undefined,
    }) as unknown as FacilityAvailability;

  /**
   * テスト用受入条件を生成する。
   */
  const createRequirement = (): FacilityRequirement =>
    ({
      requirementId: '05141f9c-4613-4447-86f3-3226b55abc23',
      facilityId: '5ea06a45-7587-4198-b94c-56e0044399c7',
      minCareLevel: 1,
      maxCareLevel: 5,
      dementiaAccepted: true,
      medicalCareAccepted: true,
      wheelchairAccepted: true,
      endOfLifeCare: false,
      note: '認知症・医療ケア対応可能。詳細は事前相談。',
      createdAt: new Date(),
      updatedAt: new Date(),
      facility: undefined,
    }) as unknown as FacilityRequirement;

  /**
   * テスト用料金情報を生成する。
   */
  const createPricing = (): FacilityPricing =>
    ({
      pricingId: 'ce8848d1-b654-485b-a962-93bdc8e88d7d',

      facilityId: '5ea06a45-7587-4198-b94c-56e0044399c7',

      monthlyCostMin: 120000,

      monthlyCostMax: 180000,

      entranceFee: 0,

      note: '医療費・介護保険自己負担分は別途必要です。',

      createdAt: new Date(),

      updatedAt: new Date(),

      facility: undefined,
    }) as unknown as FacilityPricing;

  /**
   * テスト用FacilityStaffを生成する。
   */
  const createFacilityStaff = (
    facilityId: string,
    userId: string,
  ): FacilityStaff =>
    ({
      facilityStaffId: '22222222-2222-4222-8222-222222222222',

      userId,

      facilityId,

      role: FacilityStaffRole.MANAGER,

      status: FacilityStaffStatus.ACTIVE,

      createdAt: new Date(),

      updatedAt: new Date(),

      user: undefined,

      facility: undefined,
    }) as unknown as FacilityStaff;

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
    userId: 'e894fb00-45a4-44ca-a028-6a2f560a77b3',

    role: UserRole.ADMIN,

    email: 'admin@example.com',
  };

  /**
   * ケアマネ。
   */
  const careManagerUser: AuthenticatedUser = {
    userId: '01541a48-ac15-4279-ac45-166b923f14c9',

    role: UserRole.CARE_MANAGER,

    email: 'caremanager@example.com',
  };

  beforeEach(() => {
    jest.clearAllMocks();

    /**
     * テスト用Repositoryモックを、
     * FacilitiesServiceが要求するRepository型へ変換する。
     */
    const facilityRepo = facilityRepository as unknown as Repository<Facility>;

    const availabilityRepo =
      facilityAvailabilityRepository as unknown as Repository<FacilityAvailability>;

    const staffRepo =
      facilityStaffRepository as unknown as Repository<FacilityStaff>;

    const requirementRepo =
      facilityRequirementRepository as unknown as Repository<FacilityRequirement>;

    /**
     * FacilitiesServiceのconstructorは4引数。
     */
    const pricingRepo =
      facilityPricingRepository as unknown as Repository<FacilityPricing>;

    /**
     * FacilitiesServiceのconstructorは5引数。
     */
    service = new FacilitiesService(
      facilityRepo,
      availabilityRepo,
      staffRepo,
      requirementRepo,
      pricingRepo,
    );
  });

  it('FACILITYは自施設の空き状況を更新できる', async () => {
    const facility = createFacility();

    const availability = createAvailability();

    facilityRepository.findOne.mockResolvedValue(facility);

    facilityStaffRepository.findOne.mockResolvedValue(
      createFacilityStaff(facility.facilityId, facilityUser.userId),
    );

    facilityAvailabilityRepository.findOne.mockResolvedValue(availability);

    const savedAvailability: FacilityAvailability = {
      ...availability,

      status: AvailabilityStatus.AVAILABLE,

      availableCount: 2,

      availableFrom: '2026-09-15',

      note: '現在2床空きあり。',
    };

    facilityAvailabilityRepository.save.mockResolvedValue(savedAvailability);

    const result = await service.updateAvailability(
      facility.facilityId,

      {
        status: AvailabilityStatus.AVAILABLE,

        availableCount: 2,

        availableFrom: '2026-09-15',

        note: '現在2床空きあり。',
      },

      facilityUser,
    );

    expect(result.status).toBe(AvailabilityStatus.AVAILABLE);

    expect(result.availableCount).toBe(2);

    /**
     * facility_staffを使って
     * 自施設所属を確認していることを検証する。
     */
    expect(facilityStaffRepository.findOne).toHaveBeenCalledWith({
      where: {
        userId: facilityUser.userId,

        facilityId: facility.facilityId,

        status: FacilityStaffStatus.ACTIVE,
      },
    });

    expect(facilityAvailabilityRepository.save).toHaveBeenCalled();
  });

  it('FACILITYは他施設の空き状況を更新できない', async () => {
    const facility = createFacility();

    facilityRepository.findOne.mockResolvedValue(facility);

    /**
     * 対象施設へのACTIVEな所属なし。
     */
    facilityStaffRepository.findOne.mockResolvedValue(null);

    await expect(
      service.updateAvailability(
        facility.facilityId,

        {
          status: AvailabilityStatus.AVAILABLE,
        },

        facilityUser,
      ),
    ).rejects.toBeInstanceOf(ForbiddenException);

    expect(facilityAvailabilityRepository.findOne).not.toHaveBeenCalled();

    expect(facilityAvailabilityRepository.save).not.toHaveBeenCalled();
  });

  it('ADMINは任意施設の空き状況を更新できる', async () => {
    const facility = createFacility();

    const availability = createAvailability();

    facilityRepository.findOne.mockResolvedValue(facility);

    facilityAvailabilityRepository.findOne.mockResolvedValue(availability);

    const savedAvailability: FacilityAvailability = {
      ...availability,

      status: AvailabilityStatus.AVAILABLE,
    };

    facilityAvailabilityRepository.save.mockResolvedValue(savedAvailability);

    const result = await service.updateAvailability(
      facility.facilityId,

      {
        status: AvailabilityStatus.AVAILABLE,
      },

      adminUser,
    );

    expect(result.status).toBe(AvailabilityStatus.AVAILABLE);

    /**
     * ADMINの場合は
     * facility_staff確認不要。
     */
    expect(facilityStaffRepository.findOne).not.toHaveBeenCalled();

    expect(facilityAvailabilityRepository.save).toHaveBeenCalled();
  });

  it('CARE_MANAGERは空き状況を更新できない', async () => {
    const facility = createFacility();

    facilityRepository.findOne.mockResolvedValue(facility);

    await expect(
      service.updateAvailability(
        facility.facilityId,

        {
          status: AvailabilityStatus.AVAILABLE,
        },

        careManagerUser,
      ),
    ).rejects.toBeInstanceOf(ForbiddenException);

    expect(facilityAvailabilityRepository.findOne).not.toHaveBeenCalled();

    expect(facilityAvailabilityRepository.save).not.toHaveBeenCalled();
  });

  it('存在しない施設は404になる', async () => {
    facilityRepository.findOne.mockResolvedValue(null);

    await expect(
      service.updateAvailability(
        'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa',

        {
          status: AvailabilityStatus.AVAILABLE,
        },

        adminUser,
      ),
    ).rejects.toBeInstanceOf(NotFoundException);

    expect(facilityStaffRepository.findOne).not.toHaveBeenCalled();

    expect(facilityAvailabilityRepository.findOne).not.toHaveBeenCalled();

    expect(facilityAvailabilityRepository.save).not.toHaveBeenCalled();
  });

  it('空き状況が未作成の場合は新規作成する', async () => {
    const facility = createFacility();

    facilityRepository.findOne.mockResolvedValue(facility);

    facilityAvailabilityRepository.findOne.mockResolvedValue(null);

    const newAvailability = createAvailability();

    newAvailability.status = AvailabilityStatus.AVAILABLE;

    newAvailability.availableCount = 2;

    newAvailability.availableFrom = '2026-09-15';

    newAvailability.note = '新規空き状況';

    facilityAvailabilityRepository.create.mockReturnValue(newAvailability);

    facilityAvailabilityRepository.save.mockResolvedValue(newAvailability);

    const result = await service.updateAvailability(
      facility.facilityId,

      {
        status: AvailabilityStatus.AVAILABLE,

        availableCount: 2,

        availableFrom: '2026-09-15',

        note: '新規空き状況',
      },

      adminUser,
    );

    expect(facilityAvailabilityRepository.create).toHaveBeenCalledWith({
      facilityId: facility.facilityId,
    });

    expect(result.facilityId).toBe(facility.facilityId);

    expect(facilityAvailabilityRepository.save).toHaveBeenCalled();
  });

  it('PATCHでは指定された項目だけ更新する', async () => {
    const facility = createFacility();

    const originalAvailability = createAvailability();

    originalAvailability.status = AvailabilityStatus.FEW;

    originalAvailability.availableCount = 1;

    originalAvailability.availableFrom = '2026-09-20';

    originalAvailability.note = '元のメモ';

    facilityRepository.findOne.mockResolvedValue(facility);

    facilityAvailabilityRepository.findOne.mockResolvedValue(
      originalAvailability,
    );

    facilityAvailabilityRepository.save.mockImplementation(
      async (target: FacilityAvailability) => target,
    );

    const result = await service.updateAvailability(
      facility.facilityId,

      {
        availableCount: 3,
      },

      adminUser,
    );

    /**
     * 指定したavailableCountだけ更新。
     */
    expect(result.availableCount).toBe(3);

    /**
     * 未指定項目は維持される。
     */
    expect(result.status).toBe(AvailabilityStatus.FEW);

    expect(result.availableFrom).toBe('2026-09-20');

    expect(result.note).toBe('元のメモ');

    expect(facilityAvailabilityRepository.save).toHaveBeenCalledWith(
      expect.objectContaining({
        availableCount: 3,

        status: AvailabilityStatus.FEW,

        availableFrom: '2026-09-20',

        note: '元のメモ',
      }),
    );
  });

  describe('updateRequirement', () => {
    it('FACILITYは自施設の受入条件を更新できる', async () => {
      const facility = createFacility();
      const requirement = createRequirement();

      facilityRepository.findOne.mockResolvedValue(facility);
      facilityStaffRepository.findOne.mockResolvedValue(
        createFacilityStaff(facility.facilityId, facilityUser.userId),
      );
      facilityRequirementRepository.findOne.mockResolvedValue(requirement);

      const savedRequirement: FacilityRequirement = {
        ...requirement,
        minCareLevel: 2,
        maxCareLevel: 5,
        note: '要介護2以上を受け入れ可能。',
      };

      facilityRequirementRepository.save.mockResolvedValue(savedRequirement);

      const result = await service.updateRequirement(
        facility.facilityId,
        {
          minCareLevel: 2,
          maxCareLevel: 5,
          note: '要介護2以上を受け入れ可能。',
        },
        facilityUser,
      );

      expect(result.minCareLevel).toBe(2);
      expect(result.maxCareLevel).toBe(5);

      expect(facilityStaffRepository.findOne).toHaveBeenCalledWith({
        where: {
          userId: facilityUser.userId,
          facilityId: facility.facilityId,
          status: FacilityStaffStatus.ACTIVE,
        },
      });

      expect(facilityRequirementRepository.save).toHaveBeenCalled();
    });

    it('FACILITYは他施設の受入条件を更新できない', async () => {
      const facility = createFacility();

      facilityRepository.findOne.mockResolvedValue(facility);
      facilityStaffRepository.findOne.mockResolvedValue(null);

      await expect(
        service.updateRequirement(
          facility.facilityId,
          { dementiaAccepted: true },
          facilityUser,
        ),
      ).rejects.toBeInstanceOf(ForbiddenException);

      expect(facilityRequirementRepository.findOne).not.toHaveBeenCalled();
      expect(facilityRequirementRepository.save).not.toHaveBeenCalled();
    });

    it('ADMINは任意施設の受入条件を更新できる', async () => {
      const facility = createFacility();
      const requirement = createRequirement();

      facilityRepository.findOne.mockResolvedValue(facility);
      facilityRequirementRepository.findOne.mockResolvedValue(requirement);

      const savedRequirement: FacilityRequirement = {
        ...requirement,
        medicalCareAccepted: false,
      };

      facilityRequirementRepository.save.mockResolvedValue(savedRequirement);

      const result = await service.updateRequirement(
        facility.facilityId,
        { medicalCareAccepted: false },
        adminUser,
      );

      expect(result.medicalCareAccepted).toBe(false);
      expect(facilityStaffRepository.findOne).not.toHaveBeenCalled();
      expect(facilityRequirementRepository.save).toHaveBeenCalled();
    });

    it('CARE_MANAGERは受入条件を更新できない', async () => {
      const facility = createFacility();

      facilityRepository.findOne.mockResolvedValue(facility);

      await expect(
        service.updateRequirement(
          facility.facilityId,
          { dementiaAccepted: true },
          careManagerUser,
        ),
      ).rejects.toBeInstanceOf(ForbiddenException);

      expect(facilityRequirementRepository.findOne).not.toHaveBeenCalled();
      expect(facilityRequirementRepository.save).not.toHaveBeenCalled();
    });

    it('存在しない施設の受入条件更新は404になる', async () => {
      facilityRepository.findOne.mockResolvedValue(null);

      await expect(
        service.updateRequirement(
          'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa',
          { dementiaAccepted: true },
          adminUser,
        ),
      ).rejects.toBeInstanceOf(NotFoundException);

      expect(facilityRequirementRepository.findOne).not.toHaveBeenCalled();
      expect(facilityRequirementRepository.save).not.toHaveBeenCalled();
    });

    it('受入条件が未作成の場合は新規作成する', async () => {
      const facility = createFacility();
      const newRequirement = createRequirement();

      facilityRepository.findOne.mockResolvedValue(facility);
      facilityRequirementRepository.findOne.mockResolvedValue(null);
      facilityRequirementRepository.create.mockReturnValue(newRequirement);
      facilityRequirementRepository.save.mockResolvedValue(newRequirement);

      const result = await service.updateRequirement(
        facility.facilityId,
        {
          minCareLevel: 1,
          maxCareLevel: 5,
          dementiaAccepted: true,
          medicalCareAccepted: true,
          wheelchairAccepted: true,
          endOfLifeCare: false,
          note: '新規受入条件',
        },
        adminUser,
      );

      expect(facilityRequirementRepository.create).toHaveBeenCalledWith({
        facilityId: facility.facilityId,
      });
      expect(result.facilityId).toBe(facility.facilityId);
      expect(facilityRequirementRepository.save).toHaveBeenCalled();
    });

    it('PATCHでは指定された受入条件だけ更新する', async () => {
      const facility = createFacility();
      const originalRequirement = createRequirement();

      originalRequirement.note = '元のメモ';

      facilityRepository.findOne.mockResolvedValue(facility);
      facilityRequirementRepository.findOne.mockResolvedValue(
        originalRequirement,
      );
      facilityRequirementRepository.save.mockImplementation(
        async (target: FacilityRequirement) => target,
      );

      const result = await service.updateRequirement(
        facility.facilityId,
        { note: '更新後のメモ' },
        adminUser,
      );

      expect(result.note).toBe('更新後のメモ');
      expect(result.minCareLevel).toBe(1);
      expect(result.maxCareLevel).toBe(5);
      expect(result.dementiaAccepted).toBe(true);
      expect(result.medicalCareAccepted).toBe(true);
      expect(result.wheelchairAccepted).toBe(true);
      expect(result.endOfLifeCare).toBe(false);

      expect(facilityRequirementRepository.save).toHaveBeenCalledWith(
        expect.objectContaining({
          minCareLevel: 1,
          maxCareLevel: 5,
          dementiaAccepted: true,
          medicalCareAccepted: true,
          wheelchairAccepted: true,
          endOfLifeCare: false,
          note: '更新後のメモ',
        }),
      );
    });

    it('minCareLevelがmaxCareLevelを上回る場合は400になる', async () => {
      const facility = createFacility();
      const requirement = createRequirement();

      facilityRepository.findOne.mockResolvedValue(facility);
      facilityRequirementRepository.findOne.mockResolvedValue(requirement);

      await expect(
        service.updateRequirement(
          facility.facilityId,
          {
            minCareLevel: 4,
            maxCareLevel: 2,
          },
          adminUser,
        ),
      ).rejects.toBeInstanceOf(BadRequestException);

      expect(facilityRequirementRepository.save).not.toHaveBeenCalled();
    });
    describe('updateFacility', () => {
      /**
       * updateFacility() は保存後に findOne() を呼ぶため、
       * 最新施設情報を返す部分をモックする。
       */
      const mockFacilityResponse = (facility: Facility): FacilityResponseDto =>
        ({
          facilityId: facility.facilityId,

          facilityTypeId: facility.facilityTypeId,

          name: facility.name,

          postalCode: facility.postalCode,

          address: facility.address,

          area: facility.area,

          phone: facility.phone,

          description: facility.description,
        }) as unknown as FacilityResponseDto;

      it('FACILITYは自施設の基本情報を更新できる', async () => {
        const facility = createFacility();

        facilityRepository.findOne.mockResolvedValue(facility);

        facilityStaffRepository.findOne.mockResolvedValue(
          createFacilityStaff(facility.facilityId, facilityUser.userId),
        );

        facilityRepository.save.mockImplementation(
          async (target: Facility) => target,
        );

        const updatedResponse = {
          ...mockFacilityResponse(facility),

          name: 'サンプル介護ホーム新潟',

          area: '新潟市中央区',
        } as FacilityResponseDto;

        jest.spyOn(service, 'findOne').mockResolvedValue(updatedResponse);

        const result = await service.updateFacility(
          facility.facilityId,

          {
            name: 'サンプル介護ホーム新潟',

            area: '新潟市中央区',
          },

          facilityUser,
        );

        expect(facilityStaffRepository.findOne).toHaveBeenCalledWith({
          where: {
            userId: facilityUser.userId,

            facilityId: facility.facilityId,

            status: FacilityStaffStatus.ACTIVE,
          },
        });

        expect(facilityRepository.save).toHaveBeenCalledWith(
          expect.objectContaining({
            name: 'サンプル介護ホーム新潟',

            area: '新潟市中央区',
          }),
        );

        expect(result.name).toBe('サンプル介護ホーム新潟');
      });

      it('FACILITYは他施設の基本情報を更新できない', async () => {
        const facility = createFacility();

        facilityRepository.findOne.mockResolvedValue(facility);

        facilityStaffRepository.findOne.mockResolvedValue(null);

        await expect(
          service.updateFacility(
            facility.facilityId,

            {
              name: '更新不可施設',
            },

            facilityUser,
          ),
        ).rejects.toBeInstanceOf(ForbiddenException);

        expect(facilityRepository.save).not.toHaveBeenCalled();
      });

      it('ADMINは任意施設の基本情報を更新できる', async () => {
        const facility = createFacility();

        facilityRepository.findOne.mockResolvedValue(facility);

        facilityRepository.save.mockImplementation(
          async (target: Facility) => target,
        );

        const updatedResponse = {
          ...mockFacilityResponse(facility),

          phone: '025-999-9999',
        } as FacilityResponseDto;

        jest.spyOn(service, 'findOne').mockResolvedValue(updatedResponse);

        const result = await service.updateFacility(
          facility.facilityId,

          {
            phone: '025-999-9999',
          },

          adminUser,
        );

        expect(result.phone).toBe('025-999-9999');

        expect(facilityStaffRepository.findOne).not.toHaveBeenCalled();

        expect(facilityRepository.save).toHaveBeenCalled();
      });

      it('CARE_MANAGERは施設基本情報を更新できない', async () => {
        const facility = createFacility();

        facilityRepository.findOne.mockResolvedValue(facility);

        await expect(
          service.updateFacility(
            facility.facilityId,

            {
              name: '更新不可',
            },

            careManagerUser,
          ),
        ).rejects.toBeInstanceOf(ForbiddenException);

        expect(facilityRepository.save).not.toHaveBeenCalled();
      });

      it('存在しない施設の基本情報更新は404になる', async () => {
        facilityRepository.findOne.mockResolvedValue(null);

        await expect(
          service.updateFacility(
            'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa',

            {
              name: '存在しない施設',
            },

            adminUser,
          ),
        ).rejects.toBeInstanceOf(NotFoundException);

        expect(facilityStaffRepository.findOne).not.toHaveBeenCalled();

        expect(facilityRepository.save).not.toHaveBeenCalled();
      });

      it('PATCHでは指定された基本情報だけ更新する', async () => {
        const facility = createFacility();

        facility.name = '元の施設名';

        facility.area = '新潟市';

        facility.phone = '025-111-1111';

        facility.description = '元の説明';

        facilityRepository.findOne.mockResolvedValue(facility);

        facilityRepository.save.mockImplementation(
          async (target: Facility) => target,
        );

        const updatedResponse = {
          ...mockFacilityResponse(facility),

          name: '変更後施設名',
        } as FacilityResponseDto;

        jest.spyOn(service, 'findOne').mockResolvedValue(updatedResponse);

        await service.updateFacility(
          facility.facilityId,

          {
            name: '変更後施設名',
          },

          adminUser,
        );

        expect(facilityRepository.save).toHaveBeenCalledWith(
          expect.objectContaining({
            name: '変更後施設名',

            area: '新潟市',

            phone: '025-111-1111',

            description: '元の説明',
          }),
        );
      });

      it('nullable項目はnullでクリアできる', async () => {
        const facility = createFacility();

        facility.phone = '025-111-1111';

        facility.description = '施設説明';

        facilityRepository.findOne.mockResolvedValue(facility);

        facilityRepository.save.mockImplementation(
          async (target: Facility) => target,
        );

        const updatedResponse = {
          ...mockFacilityResponse(facility),

          phone: null,

          description: null,
        } as FacilityResponseDto;

        jest.spyOn(service, 'findOne').mockResolvedValue(updatedResponse);

        const result = await service.updateFacility(
          facility.facilityId,

          {
            phone: null,

            description: null,
          },

          adminUser,
        );

        expect(facilityRepository.save).toHaveBeenCalledWith(
          expect.objectContaining({
            phone: null,

            description: null,
          }),
        );

        expect(result.phone).toBeNull();

        expect(result.description).toBeNull();
      });
    });
  });

  describe('updatePricing', () => {
    it('FACILITYは自施設の料金情報を更新できる', async () => {
      const facility = createFacility();
      const pricing = createPricing();

      facilityRepository.findOne.mockResolvedValue(facility);

      facilityStaffRepository.findOne.mockResolvedValue(
        createFacilityStaff(facility.facilityId, facilityUser.userId),
      );

      facilityPricingRepository.findOne.mockResolvedValue(pricing);

      const savedPricing: FacilityPricing = {
        ...pricing,
        monthlyCostMin: 130000,
        monthlyCostMax: 190000,
        entranceFee: 50000,
        note: '料金改定後',
      };

      facilityPricingRepository.save.mockResolvedValue(savedPricing);

      const result = await service.updatePricing(
        facility.facilityId,
        {
          monthlyCostMin: 130000,
          monthlyCostMax: 190000,
          entranceFee: 50000,
          note: '料金改定後',
        },
        facilityUser,
      );

      expect(result.monthlyCostMin).toBe(130000);
      expect(result.monthlyCostMax).toBe(190000);
      expect(result.entranceFee).toBe(50000);

      expect(facilityStaffRepository.findOne).toHaveBeenCalledWith({
        where: {
          userId: facilityUser.userId,
          facilityId: facility.facilityId,
          status: FacilityStaffStatus.ACTIVE,
        },
      });

      expect(facilityPricingRepository.save).toHaveBeenCalled();
    });

    it('FACILITYは他施設の料金情報を更新できない', async () => {
      const facility = createFacility();

      facilityRepository.findOne.mockResolvedValue(facility);

      facilityStaffRepository.findOne.mockResolvedValue(null);

      await expect(
        service.updatePricing(
          facility.facilityId,
          {
            monthlyCostMin: 130000,
          },
          facilityUser,
        ),
      ).rejects.toBeInstanceOf(ForbiddenException);

      expect(facilityPricingRepository.findOne).not.toHaveBeenCalled();

      expect(facilityPricingRepository.save).not.toHaveBeenCalled();
    });

    it('ADMINは任意施設の料金情報を更新できる', async () => {
      const facility = createFacility();
      const pricing = createPricing();

      facilityRepository.findOne.mockResolvedValue(facility);

      facilityPricingRepository.findOne.mockResolvedValue(pricing);

      const savedPricing: FacilityPricing = {
        ...pricing,
        entranceFee: 100000,
      };

      facilityPricingRepository.save.mockResolvedValue(savedPricing);

      const result = await service.updatePricing(
        facility.facilityId,
        {
          entranceFee: 100000,
        },
        adminUser,
      );

      expect(result.entranceFee).toBe(100000);

      expect(facilityStaffRepository.findOne).not.toHaveBeenCalled();

      expect(facilityPricingRepository.save).toHaveBeenCalled();
    });

    it('CARE_MANAGERは料金情報を更新できない', async () => {
      const facility = createFacility();

      facilityRepository.findOne.mockResolvedValue(facility);

      await expect(
        service.updatePricing(
          facility.facilityId,
          {
            monthlyCostMin: 130000,
          },
          careManagerUser,
        ),
      ).rejects.toBeInstanceOf(ForbiddenException);

      expect(facilityPricingRepository.findOne).not.toHaveBeenCalled();

      expect(facilityPricingRepository.save).not.toHaveBeenCalled();
    });

    it('存在しない施設の料金情報更新は404になる', async () => {
      facilityRepository.findOne.mockResolvedValue(null);

      await expect(
        service.updatePricing(
          'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa',
          {
            monthlyCostMin: 130000,
          },
          adminUser,
        ),
      ).rejects.toBeInstanceOf(NotFoundException);

      expect(facilityPricingRepository.findOne).not.toHaveBeenCalled();

      expect(facilityPricingRepository.save).not.toHaveBeenCalled();
    });

    it('料金情報が未作成の場合は新規作成する', async () => {
      const facility = createFacility();

      facilityRepository.findOne.mockResolvedValue(facility);

      facilityPricingRepository.findOne.mockResolvedValue(null);

      const newPricing = createPricing();

      newPricing.monthlyCostMin = 100000;
      newPricing.monthlyCostMax = 150000;
      newPricing.entranceFee = 0;
      newPricing.note = '新規料金情報';

      facilityPricingRepository.create.mockReturnValue(newPricing);

      facilityPricingRepository.save.mockResolvedValue(newPricing);

      const result = await service.updatePricing(
        facility.facilityId,
        {
          monthlyCostMin: 100000,
          monthlyCostMax: 150000,
          entranceFee: 0,
          note: '新規料金情報',
        },
        adminUser,
      );

      expect(facilityPricingRepository.create).toHaveBeenCalledWith({
        facilityId: facility.facilityId,
        monthlyCostMin: 0,
        monthlyCostMax: 0,
        entranceFee: 0,
        note: null,
      });

      expect(result.facilityId).toBe(facility.facilityId);

      expect(facilityPricingRepository.save).toHaveBeenCalled();
    });

    it('PATCHでは指定された料金項目だけ更新する', async () => {
      const facility = createFacility();
      const originalPricing = createPricing();

      originalPricing.monthlyCostMin = 120000;
      originalPricing.monthlyCostMax = 180000;
      originalPricing.entranceFee = 0;
      originalPricing.note = '元のメモ';

      facilityRepository.findOne.mockResolvedValue(facility);

      facilityPricingRepository.findOne.mockResolvedValue(originalPricing);

      facilityPricingRepository.save.mockImplementation(
        async (target: FacilityPricing) => target,
      );

      const result = await service.updatePricing(
        facility.facilityId,
        {
          entranceFee: 50000,
        },
        adminUser,
      );

      expect(result.entranceFee).toBe(50000);
      expect(result.monthlyCostMin).toBe(120000);
      expect(result.monthlyCostMax).toBe(180000);
      expect(result.note).toBe('元のメモ');

      expect(facilityPricingRepository.save).toHaveBeenCalledWith(
        expect.objectContaining({
          monthlyCostMin: 120000,
          monthlyCostMax: 180000,
          entranceFee: 50000,
          note: '元のメモ',
        }),
      );
    });

    it('monthlyCostMinがmonthlyCostMaxを上回る場合は400になる', async () => {
      const facility = createFacility();
      const pricing = createPricing();

      facilityRepository.findOne.mockResolvedValue(facility);

      facilityPricingRepository.findOne.mockResolvedValue(pricing);

      await expect(
        service.updatePricing(
          facility.facilityId,
          {
            monthlyCostMin: 200000,
            monthlyCostMax: 150000,
          },
          adminUser,
        ),
      ).rejects.toBeInstanceOf(BadRequestException);

      expect(facilityPricingRepository.save).not.toHaveBeenCalled();
    });
    describe('getDashboard', () => {
      /**
       * ダッシュボード用の施設詳細レスポンスを生成する。
       */
      const createDashboardFacilityResponse = (): FacilityResponseDto =>
        ({
          facilityId: '5ea06a45-7587-4198-b94c-56e0044399c7',

          name: 'サンプル介護ホーム新潟',

          postalCode: '950-0000',

          address: '新潟県新潟市中央区サンプル1-2-3',

          area: '新潟市中央区',

          phone: null,

          description: null,

          status: 'ACTIVE',

          facilityType: {
            facilityTypeId: 'f611d3fa-a0b6-49ef-857e-1b1c15c1248c',

            name: '住宅型有料老人ホーム',
          },

          availability: {
            availabilityId: 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa',

            facilityId: '5ea06a45-7587-4198-b94c-56e0044399c7',

            status: AvailabilityStatus.AVAILABLE,

            availableCount: 2,

            availableFrom: '2026-09-15',

            note: '現在2床空きあり',

            updatedAt: new Date(),
          },

          pricing: {
            pricingId: 'bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb',

            facilityId: '5ea06a45-7587-4198-b94c-56e0044399c7',

            monthlyCostMin: 120000,

            monthlyCostMax: 180000,

            entranceFee: 0,

            note: '医療費等は別途必要',

            updatedAt: new Date(),
          },

          requirement: {
            requirementId: 'cccccccc-cccc-4ccc-8ccc-cccccccccccc',

            facilityId: '5ea06a45-7587-4198-b94c-56e0044399c7',

            minCareLevel: 1,

            maxCareLevel: 5,

            dementiaAccepted: true,

            medicalCareAccepted: true,

            wheelchairAccepted: true,

            endOfLifeCare: false,

            note: '詳細は事前相談',

            updatedAt: new Date(),
          },
        }) as unknown as FacilityResponseDto;

      it('FACILITYは自施設のダッシュボードを取得できる', async () => {
        const facility = createFacility();

        const facilityDetail = createDashboardFacilityResponse();

        facilityRepository.findOne.mockResolvedValue(facility);

        facilityStaffRepository.findOne.mockResolvedValue(
          createFacilityStaff(facility.facilityId, facilityUser.userId),
        );

        /**
         * getDashboard()内部のfindOne()をモックする。
         */
        jest.spyOn(service, 'findOne').mockResolvedValue(facilityDetail);

        const result = await service.getDashboard(
          facility.facilityId,
          facilityUser,
        );

        expect(result.facility.facilityId).toBe(facility.facilityId);

        expect(result.completion).toEqual({
          availability: true,

          pricing: true,

          requirement: true,
        });

        expect(facilityStaffRepository.findOne).toHaveBeenCalledWith({
          where: {
            userId: facilityUser.userId,

            facilityId: facility.facilityId,

            status: FacilityStaffStatus.ACTIVE,
          },
        });
      });

      it('FACILITYは他施設のダッシュボードを取得できない', async () => {
        const facility = createFacility();

        facilityRepository.findOne.mockResolvedValue(facility);

        facilityStaffRepository.findOne.mockResolvedValue(null);

        await expect(
          service.getDashboard(facility.facilityId, facilityUser),
        ).rejects.toBeInstanceOf(ForbiddenException);

        expect(facilityStaffRepository.findOne).toHaveBeenCalled();

        expect(facilityRepository.save).not.toHaveBeenCalled();
      });

      it('ADMINは任意施設のダッシュボードを取得できる', async () => {
        const facility = createFacility();

        const facilityDetail = createDashboardFacilityResponse();

        facilityRepository.findOne.mockResolvedValue(facility);

        jest.spyOn(service, 'findOne').mockResolvedValue(facilityDetail);

        const result = await service.getDashboard(
          facility.facilityId,
          adminUser,
        );

        expect(result.facility.facilityId).toBe(facility.facilityId);

        /**
         * ADMINはfacility_staff確認不要。
         */
        expect(facilityStaffRepository.findOne).not.toHaveBeenCalled();
      });

      it('CARE_MANAGERはダッシュボードを取得できない', async () => {
        const facility = createFacility();

        facilityRepository.findOne.mockResolvedValue(facility);

        await expect(
          service.getDashboard(facility.facilityId, careManagerUser),
        ).rejects.toBeInstanceOf(ForbiddenException);

        expect(facilityStaffRepository.findOne).not.toHaveBeenCalled();
      });

      it('存在しない施設のダッシュボードは404になる', async () => {
        facilityRepository.findOne.mockResolvedValue(null);

        await expect(
          service.getDashboard(
            'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa',
            adminUser,
          ),
        ).rejects.toBeInstanceOf(NotFoundException);

        expect(facilityStaffRepository.findOne).not.toHaveBeenCalled();
      });

      it('未登録情報がある場合completionはfalseになる', async () => {
        const facility = createFacility();

        const facilityDetail = createDashboardFacilityResponse();

        /**
         * pricingとrequirementを
         * 未登録状態にする。
         */
        facilityDetail.pricing = null;

        facilityDetail.requirement = null;

        facilityRepository.findOne.mockResolvedValue(facility);

        jest.spyOn(service, 'findOne').mockResolvedValue(facilityDetail);

        const result = await service.getDashboard(
          facility.facilityId,
          adminUser,
        );

        expect(result.completion).toEqual({
          availability: true,

          pricing: false,

          requirement: false,
        });
      });
    });
  });
});
