import 'dotenv/config';

import { DataSource } from 'typeorm';

import { User } from '../modules/users/entities/user.entity';
import { CareManager } from '../modules/care-managers/entities/care-manager.entity';

import { FacilityType } from '../modules/facilities/entities/facility-type.entity';
import { Facility } from '../modules/facilities/entities/facility.entity';
import { FacilityAvailability } from '../modules/facilities/entities/facility-availability.entity';
import { FacilityPricing } from '../modules/facilities/entities/facility-pricing.entity';
import { FacilityRequirement } from '../modules/facilities/entities/facility-requirement.entity';
import { FacilityStaff } from '../modules/facilities/entities/facility-staff.entity';

import { Inquiry } from '../modules/inquiries/entities/inquiry.entity';
import { InquiryMessage } from '../modules/inquiries/entities/inquiry-message.entity';
import { Organization } from '../modules/organizations/entities/organization.entity';
import { CareManagerOffice } from '../modules/care-managers/entities/care-manager-office.entity';
import { PlacementCase } from '../modules/placement-cases/entities/placement-case.entity';
import { ClientCondition } from '../modules/placement-cases/entities/client-condition.entity';
import { MedicalConditionMaster } from '../modules/medical-conditions/entities/medical-condition-master.entity';
import { CaseMedicalRequirement } from '../modules/placement-cases/entities/case-medical-requirement.entity';
import { FacilityMedicalCapability } from '../modules/facilities/entities/facility-medical-capability.entity';
import { CandidateFacility } from '../modules/placement-cases/entities/candidate-facility.entity';

/**
 * クラウドPostgreSQL用の接続URL。
 *
 * DATABASE_URLが設定されている場合は、
 * NeonなどのクラウドPostgreSQLへ接続する。
 *
 * 未設定の場合は、
 * 従来どおりローカルDocker PostgreSQLへ接続する。
 */
const databaseUrl = process.env.DATABASE_URL;

const AppDataSource = new DataSource({
  type: 'postgres',

  /**
   * DATABASE_URLが存在する場合は、
   * URL形式で接続する。
   */
  ...(databaseUrl
    ? {
        url: databaseUrl,

        /**
         * NeonなどのクラウドPostgreSQL用。
         */
        ssl: {
          rejectUnauthorized: false,
        },
      }
    : {
        /**
         * ローカルDocker PostgreSQL用。
         */
        host: process.env.DB_HOST,

        port: Number(process.env.DB_PORT ?? 5432),

        username: process.env.DB_USERNAME,

        password: process.env.DB_PASSWORD,

        database: process.env.DB_DATABASE,
      }),

  entities: [
    User,
    CareManager,
    Organization,
    CareManagerOffice,
    PlacementCase,
    ClientCondition,
    CaseMedicalRequirement,

    FacilityType,
    Facility,
    FacilityAvailability,
    FacilityPricing,
    FacilityRequirement,
    FacilityStaff,
    MedicalConditionMaster,
    FacilityMedicalCapability,
    CandidateFacility,
    Inquiry,
    InquiryMessage,
  ],

  migrations: ['src/database/migrations/*.ts'],

  /**
   * DBスキーマはMigrationで管理する。
   */
  synchronize: false,

  logging: process.env.NODE_ENV === 'development',
});

export default AppDataSource;
