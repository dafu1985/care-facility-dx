import 'dotenv/config';

import { DataSource } from 'typeorm';

import { User } from '../modules/users/entities/user.entity';
import { CareManager } from '../modules/care-managers/entities/care-manager.entity';
import { FacilityType } from '../modules/facilities/entities/facility-type.entity';
import { Facility } from '../modules/facilities/entities/facility.entity';
import { FacilityAvailability } from '../modules/facilities/entities/facility-availability.entity';
import { FacilityPricing } from '../modules/facilities/entities/facility-pricing.entity';
import { FacilityRequirement } from '../modules/facilities/entities/facility-requirement.entity';

const AppDataSource = new DataSource({
  type: 'postgres',

  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT ?? 5432),

  username: process.env.DB_USERNAME,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_DATABASE,

  entities: [
    User,
    CareManager,
    FacilityType,
    Facility,
    FacilityAvailability,
    FacilityPricing,
    FacilityRequirement,
  ],

  migrations: [
    'src/database/migrations/*.ts',
  ],

  synchronize: false,
  logging: process.env.NODE_ENV === 'development',
});

export default AppDataSource;