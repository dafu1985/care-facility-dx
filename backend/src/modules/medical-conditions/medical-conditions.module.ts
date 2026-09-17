import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { MedicalConditionMaster } from './entities/medical-condition-master.entity';
import { MedicalConditionsController } from './medical-conditions.controller';
import { MedicalConditionsService } from './medical-conditions.service';

@Module({
  imports: [TypeOrmModule.forFeature([MedicalConditionMaster])],
  controllers: [MedicalConditionsController],
  providers: [MedicalConditionsService],
  exports: [TypeOrmModule, MedicalConditionsService],
})
export class MedicalConditionsModule {}