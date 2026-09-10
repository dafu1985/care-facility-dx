import 'dotenv/config';

import * as bcrypt from 'bcrypt';

import AppDataSource from './data-source';

import {
  User,
  UserRole,
  UserStatus,
} from '../modules/users/entities/user.entity';

import { CareManager } from '../modules/care-managers/entities/care-manager.entity';

import { FacilityType } from '../modules/facilities/entities/facility-type.entity';

import {
  Facility,
  FacilityStatus,
} from '../modules/facilities/entities/facility.entity';

import {
  AvailabilityStatus,
  FacilityAvailability,
} from '../modules/facilities/entities/facility-availability.entity';

import { FacilityPricing } from '../modules/facilities/entities/facility-pricing.entity';

import { FacilityRequirement } from '../modules/facilities/entities/facility-requirement.entity';

import {
  FacilityStaff,
  FacilityStaffRole,
  FacilityStaffStatus,
} from '../modules/facilities/entities/facility-staff.entity';

/**
 * Prototype用Seed。
 *
 * 同じメールアドレス・施設名が存在する場合は
 * 重複登録しない。
 */
async function seed() {
  /**
   * パスワードはコードへ直接記述せず、
   * 環境変数から取得する。
   */
  const seedPassword = process.env.SEED_PASSWORD;

  if (!seedPassword) {
    throw new Error('SEED_PASSWORD is not set');
  }

  await AppDataSource.initialize();

  console.log('Database connection established.');

  try {
    const userRepository = AppDataSource.getRepository(User);

    const careManagerRepository = AppDataSource.getRepository(CareManager);

    const facilityTypeRepository = AppDataSource.getRepository(FacilityType);

    const facilityRepository = AppDataSource.getRepository(Facility);

    const availabilityRepository =
      AppDataSource.getRepository(FacilityAvailability);

    const pricingRepository = AppDataSource.getRepository(FacilityPricing);

    const requirementRepository =
      AppDataSource.getRepository(FacilityRequirement);

    const facilityStaffRepository = AppDataSource.getRepository(FacilityStaff);

    /**
     * Seed用パスワードをbcryptでハッシュ化する。
     */
    const passwordHash = await bcrypt.hash(seedPassword, 10);

    // ==================================================
    // CARE_MANAGER USER
    // ==================================================

    let careManagerUser = await userRepository.findOne({
      where: {
        email: 'caremanager@example.com',
      },
    });

    if (!careManagerUser) {
      careManagerUser = userRepository.create({
        role: UserRole.CARE_MANAGER,
        email: 'caremanager@example.com',
        passwordHash,
        status: UserStatus.ACTIVE,
      });

      console.log('Created CARE_MANAGER user.');
    } else {
      /**
       * 既存ユーザーの場合も、
       * Seed時のパスワードへ更新する。
       */
      careManagerUser.passwordHash = passwordHash;
      careManagerUser.status = UserStatus.ACTIVE;

      console.log('Updated CARE_MANAGER password.');
    }

    /**
     * 新規・既存どちらの場合も保存する。
     */
    careManagerUser = await userRepository.save(careManagerUser);

    /**
     * ケアマネ詳細情報。
     */
    const existingCareManager = await careManagerRepository.findOne({
      where: {
        userId: careManagerUser.userId,
      },
    });

    if (!existingCareManager) {
      const careManager = careManagerRepository.create({
        userId: careManagerUser.userId,

        organizationName: 'サンプル居宅介護支援事業所',

        licenseNumber: 'CM-DEMO-001',
      });

      await careManagerRepository.save(careManager);

      console.log('Created CareManager.');
    }

    // ==================================================
    // FACILITY USER HELPER
    // ==================================================

    /**
     * 施設職員ユーザーを
     * 必要に応じて作成する。
     */
    async function createFacilityUserIfNeeded(email: string): Promise<User> {
      let user = await userRepository.findOne({
        where: {
          email,
        },
      });

      if (!user) {
        user = userRepository.create({
          role: UserRole.FACILITY,

          email,

          passwordHash,

          status: UserStatus.ACTIVE,
        });

        console.log(`Created FACILITY user: ${email}`);
      } else {
        /**
         * 既存ユーザーの場合も、
         * Seed時のパスワードへ更新する。
         */
        user.role = UserRole.FACILITY;
        user.passwordHash = passwordHash;
        user.status = UserStatus.ACTIVE;

        console.log(`Updated FACILITY password: ${email}`);
      }

      /**
       * 新規・既存どちらの場合も保存する。
       */
      user = await userRepository.save(user);

      return user;
    }

    /**
     * ハタケヤマ介護ホーム新潟用。
     */
    const hatakeyamaUser = await createFacilityUserIfNeeded(
      'facilitystaff@example.com',
    );

    /**
     * 長岡ケアレジデンス用。
     */
    const nagaokaUser = await createFacilityUserIfNeeded('nagaoka@example.com');

    /**
     * 新潟西シニアホーム用。
     */
    const niigataNishiUser = await createFacilityUserIfNeeded(
      'niigatanishi@example.com',
    );

    // ==================================================
    // FACILITY TYPE
    // ==================================================

    let facilityType = await facilityTypeRepository.findOne({
      where: {
        name: '住宅型有料老人ホーム',
      },
    });

    if (!facilityType) {
      const newFacilityType = facilityTypeRepository.create({
        name: '住宅型有料老人ホーム',

        description: 'プロトタイプ確認用施設種別',
      });

      facilityType = await facilityTypeRepository.save(newFacilityType);

      console.log('Created FacilityType.');
    }

    /**
     * ここまで到達した時点で
     * facilityTypeは必ず存在する。
     */
    const seededFacilityType = facilityType;

    // ==================================================
    // FACILITY HELPER
    // ==================================================

    /**
     * 施設と関連情報を
     * 必要に応じて作成する。
     */
    async function createFacilityIfNeeded(input: {
      name: string;

      postalCode: string;

      address: string;

      area: string;

      phone: string | null;

      description: string | null;

      availability: {
        status: AvailabilityStatus;

        availableCount: number | null;

        availableFrom: string | null;
      };

      pricing: {
        monthlyCostMin: number;

        monthlyCostMax: number;

        entranceFee: number;

        note: string | null;
      };

      requirement: {
        minCareLevel: number | null;

        maxCareLevel: number | null;

        dementiaAccepted: boolean;

        medicalCareAccepted: boolean;

        wheelchairAccepted: boolean;

        endOfLifeCare: boolean;

        note: string | null;
      };
    }): Promise<Facility> {
      let facility = await facilityRepository.findOne({
        where: {
          name: input.name,
        },
      });

      if (!facility) {
        facility = facilityRepository.create({
          facilityTypeId: seededFacilityType.facilityTypeId,

          name: input.name,

          postalCode: input.postalCode,

          address: input.address,

          area: input.area,

          phone: input.phone,

          description: input.description,

          status: FacilityStatus.ACTIVE,
        });

        facility = await facilityRepository.save(facility);

        console.log(`Created facility: ${facility.name}`);
      }

      /**
       * 空き状況。
       */
      const existingAvailability = await availabilityRepository.findOne({
        where: {
          facilityId: facility.facilityId,
        },
      });

      if (!existingAvailability) {
        const availability = availabilityRepository.create({
          facilityId: facility.facilityId,

          status: input.availability.status,

          availableCount: input.availability.availableCount,

          availableFrom: input.availability.availableFrom,

          note: null,
        });

        await availabilityRepository.save(availability);
      }

      /**
       * 料金。
       */
      const existingPricing = await pricingRepository.findOne({
        where: {
          facilityId: facility.facilityId,
        },
      });

      if (!existingPricing) {
        const pricing = pricingRepository.create({
          facilityId: facility.facilityId,

          monthlyCostMin: input.pricing.monthlyCostMin,

          monthlyCostMax: input.pricing.monthlyCostMax,

          entranceFee: input.pricing.entranceFee,

          note: input.pricing.note,
        });

        await pricingRepository.save(pricing);
      }

      /**
       * 受入条件。
       */
      const existingRequirement = await requirementRepository.findOne({
        where: {
          facilityId: facility.facilityId,
        },
      });

      if (!existingRequirement) {
        const requirement = requirementRepository.create({
          facilityId: facility.facilityId,

          minCareLevel: input.requirement.minCareLevel,

          maxCareLevel: input.requirement.maxCareLevel,

          dementiaAccepted: input.requirement.dementiaAccepted,

          medicalCareAccepted: input.requirement.medicalCareAccepted,

          wheelchairAccepted: input.requirement.wheelchairAccepted,

          endOfLifeCare: input.requirement.endOfLifeCare,

          note: input.requirement.note,
        });

        await requirementRepository.save(requirement);
      }

      return facility;
    }

    // ==================================================
    // FACILITY 1
    // ハタケヤマ介護ホーム新潟
    // ==================================================

    const hatakeyamaFacility = await createFacilityIfNeeded({
      name: 'ハタケヤマ介護ホーム新潟',

      postalCode: '950-1135',

      address: '新潟県新潟市江南区サンプル1-2-3',

      area: '新潟市江南区',

      phone: null,

      description: 'プロトタイプ確認用施設',

      availability: {
        status: AvailabilityStatus.UNKNOWN,

        availableCount: null,

        availableFrom: '2026-09-15',
      },

      pricing: {
        monthlyCostMin: 130000,

        monthlyCostMax: 200000,

        entranceFee: 0,

        note: '医療費・介護保険自己負担分は別途必要です。',
      },

      requirement: {
        minCareLevel: 2,

        maxCareLevel: 5,

        dementiaAccepted: true,

        medicalCareAccepted: true,

        wheelchairAccepted: true,

        endOfLifeCare: false,

        note: '認知症・医療ケア対応可能。詳細は事前相談。',
      },
    });

    // ==================================================
    // FACILITY 2
    // 長岡ケアレジデンス更新確認
    // ==================================================

    const nagaokaFacility = await createFacilityIfNeeded({
      name: '長岡ケアレジデンス更新確認',

      postalCode: '940-0000',

      address: '新潟県長岡市サンプル2-2-2',

      area: '長岡市',

      phone: '0258-000-0000',

      description: 'ページネーション・検索確認用のサンプル施設',

      availability: {
        status: AvailabilityStatus.AVAILABLE,

        availableCount: 2,

        availableFrom: '2026-09-15',
      },

      pricing: {
        monthlyCostMin: 120000,

        monthlyCostMax: 180000,

        entranceFee: 0,

        note: '医療費・介護保険自己負担分は別途必要です。',
      },

      requirement: {
        minCareLevel: 2,

        maxCareLevel: 4,

        dementiaAccepted: true,

        medicalCareAccepted: false,

        wheelchairAccepted: true,

        endOfLifeCare: false,

        note: '要介護2〜4、認知症・車椅子対応可、医療ケア・看取り非対応',
      },
    });

    // ==================================================
    // FACILITY 3
    // 新潟西シニアホーム
    // ==================================================

    const niigataNishiFacility = await createFacilityIfNeeded({
      name: '新潟西シニアホーム',

      postalCode: '950-2000',

      address: '新潟県新潟市西区サンプル3-3-3',

      area: '新潟市西区',

      phone: '025-111-1111',

      description: '検索・ページネーション確認用のサンプル施設',

      availability: {
        status: AvailabilityStatus.FULL,

        availableCount: 0,

        availableFrom: null,
      },

      pricing: {
        monthlyCostMin: 180000,

        monthlyCostMax: 220000,

        entranceFee: 100000,

        note: '月額18万円〜22万円・入居一時金10万円・開発確認用',
      },

      requirement: {
        minCareLevel: 3,

        maxCareLevel: 5,

        dementiaAccepted: false,

        medicalCareAccepted: true,

        wheelchairAccepted: true,

        endOfLifeCare: true,

        note: '要介護3〜5、医療ケア・車椅子・看取り対応可、認知症非対応',
      },
    });

    // ==================================================
    // FACILITY STAFF HELPER
    // ==================================================

    /**
     * 施設職員と施設を紐付ける。
     *
     * 既存の紐付けがある場合は
     * 重複登録しない。
     */
    async function createFacilityStaffIfNeeded(
      user: User,
      facility: Facility,
    ): Promise<void> {
      const existingFacilityStaff = await facilityStaffRepository.findOne({
        where: {
          userId: user.userId,

          facilityId: facility.facilityId,
        },
      });

      if (existingFacilityStaff) {
        return;
      }

      const facilityStaff = facilityStaffRepository.create({
        userId: user.userId,

        facilityId: facility.facilityId,

        role: FacilityStaffRole.MANAGER,

        status: FacilityStaffStatus.ACTIVE,
      });

      await facilityStaffRepository.save(facilityStaff);

      console.log(
        `Created FacilityStaff assignment: ${user.email} -> ${facility.name}`,
      );
    }

    // ==================================================
    // FACILITY STAFF ASSIGNMENT
    // ==================================================

    await createFacilityStaffIfNeeded(hatakeyamaUser, hatakeyamaFacility);

    await createFacilityStaffIfNeeded(nagaokaUser, nagaokaFacility);

    await createFacilityStaffIfNeeded(niigataNishiUser, niigataNishiFacility);

    // ==================================================
    // COMPLETED
    // ==================================================

    console.log('');
    console.log('Seed completed successfully.');

    console.log('');
    console.log('CARE_MANAGER: caremanager@example.com');

    console.log('HATAKEYAMA FACILITY: facilitystaff@example.com');

    console.log('NAGAOKA FACILITY: nagaoka@example.com');

    console.log('NIIGATA NISHI FACILITY: niigatanishi@example.com');
  } finally {
    await AppDataSource.destroy();
  }
}

seed().catch((error) => {
  console.error('Seed failed.', error);

  process.exitCode = 1;
});
