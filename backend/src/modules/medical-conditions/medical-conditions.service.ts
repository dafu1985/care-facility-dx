import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { MedicalConditionMaster } from './entities/medical-condition-master.entity';

/**
 * 医療条件マスタに関する処理を提供する。
 */
@Injectable()
export class MedicalConditionsService {
  constructor(
    @InjectRepository(MedicalConditionMaster)
    private readonly medicalConditionRepository: Repository<MedicalConditionMaster>,
  ) {}

  /**
   * 利用可能な医療条件マスタを表示順で取得する。
   *
   * 無効化された医療条件はFrontendの選択肢に表示しない。
   */
  async findAllActive(): Promise<MedicalConditionMaster[]> {
    return this.medicalConditionRepository.find({
      where: {
        isActive: true,
      },
      order: {
        displayOrder: 'ASC',
      },
    });
  }
}