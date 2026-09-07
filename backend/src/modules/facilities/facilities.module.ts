import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { FacilitiesController } from './facilities.controller';
import { FacilitiesService } from './facilities.service';
import { Facility } from './entities/facility.entity';
import { FacilityAvailability } from './entities/facility-availability.entity';
import { FacilityPricing } from './entities/facility-pricing.entity';
import { FacilityRequirement } from './entities/facility-requirement.entity';
import { FacilityType } from './entities/facility-type.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      FacilityType,
      Facility,
      FacilityAvailability,
      FacilityPricing,
      FacilityRequirement,
    ]),
  ],
  controllers: [FacilitiesController],
  providers: [FacilitiesService],
  exports: [TypeOrmModule],
})
export class FacilitiesModule {}