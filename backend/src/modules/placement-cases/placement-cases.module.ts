import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { CandidateFacility } from './entities/candidate-facility.entity';
import { CaseMedicalRequirement } from './entities/case-medical-requirement.entity';
import { ClientCondition } from './entities/client-condition.entity';
import { PlacementCase } from './entities/placement-case.entity';
import { PlacementCasesController } from './placement-cases.controller';
import { PlacementCasesService } from './placement-cases.service';
import { MedicalConditionMaster } from '../medical-conditions/entities/medical-condition-master.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      PlacementCase,
      ClientCondition,
      CaseMedicalRequirement,
      CandidateFacility,
      MedicalConditionMaster,
    ]),
  ],
  controllers: [PlacementCasesController],
  providers: [PlacementCasesService],
  exports: [TypeOrmModule, PlacementCasesService],
})
export class PlacementCasesModule {}
