import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import {
  CandidateFacility,
  CandidateFacilityStatus,
} from './entities/candidate-facility.entity';
import {
  CaseMedicalRequirement,
  MedicalRequirementLevel,
} from './entities/case-medical-requirement.entity';
import { ClientCondition } from './entities/client-condition.entity';
import { PlacementCase } from './entities/placement-case.entity';
import { PlacementCasesController } from './placement-cases.controller';
import { PlacementCasesService } from './placement-cases.service';
import { MedicalConditionMaster } from '../medical-conditions/entities/medical-condition-master.entity';
import { Facility } from '../facilities/entities/facility.entity';
import {
  FacilityMedicalCapability,
  FacilityMedicalCapabilityStatus,
} from '../facilities/entities/facility-medical-capability.entity';
import { FacilityAvailability } from '../facilities/entities/facility-availability.entity';
import { FacilityPricing } from '../facilities/entities/facility-pricing.entity';
import { FacilityRequirement } from '../facilities/entities/facility-requirement.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      PlacementCase,
      ClientCondition,
      CaseMedicalRequirement,
      CandidateFacility,
      MedicalConditionMaster,
      Facility,
      FacilityMedicalCapability,
      FacilityAvailability,
      FacilityPricing,
      FacilityRequirement,
    ]),
  ],
  controllers: [PlacementCasesController],
  providers: [PlacementCasesService],
  exports: [TypeOrmModule, PlacementCasesService],
})
export class PlacementCasesModule {}
