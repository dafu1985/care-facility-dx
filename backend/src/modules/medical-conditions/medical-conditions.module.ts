import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { MedicalConditionMaster } from './entities/medical-condition-master.entity';

@Module({
  imports: [TypeOrmModule.forFeature([MedicalConditionMaster])],
  exports: [TypeOrmModule],
})
export class MedicalConditionsModule {}
