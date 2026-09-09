import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { AuthModule } from '../auth/auth.module';
import { Inquiry } from '../inquiries/entities/inquiry.entity';

import { FacilitiesController } from './facilities.controller';
import { FacilitiesService } from './facilities.service';

import { FacilityAvailability } from './entities/facility-availability.entity';
import { FacilityPricing } from './entities/facility-pricing.entity';
import { FacilityRequirement } from './entities/facility-requirement.entity';
import { FacilityStaff } from './entities/facility-staff.entity';
import { FacilityType } from './entities/facility-type.entity';
import { Facility } from './entities/facility.entity';

@Module({
  imports: [
    /**
     * JwtAuthGuard、RolesGuardなど、
     * 認証・認可系ProviderをFacilitiesModuleで
     * 利用するためにimportする。
     */
    AuthModule,

    /**
     * FacilitiesServiceで使用するRepository。
     *
     * Inquiryは施設ダッシュボードの
     * 問い合わせサマリー取得に使用する。
     */
    TypeOrmModule.forFeature([
      FacilityType,
      Facility,
      FacilityAvailability,
      FacilityPricing,
      FacilityRequirement,
      FacilityStaff,
      Inquiry,
    ]),
  ],

  controllers: [FacilitiesController],

  providers: [FacilitiesService],

  exports: [TypeOrmModule],
})
export class FacilitiesModule {}
