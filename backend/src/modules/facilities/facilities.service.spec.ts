import { beforeEach, describe, expect, it, jest } from '@jest/globals';
import { ForbiddenException, NotFoundException } from '@nestjs/common';
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

import { FacilitiesService } from './facilities.service';

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

    /**
     * FacilitiesServiceのconstructorは3引数。
     */
    service = new FacilitiesService(facilityRepo, availabilityRepo, staffRepo);
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
});
