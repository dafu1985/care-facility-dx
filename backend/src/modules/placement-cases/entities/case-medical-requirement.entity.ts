import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

import type { Relation } from 'typeorm';

import { MedicalConditionMaster } from '../../medical-conditions/entities/medical-condition-master.entity';
import { PlacementCase } from './placement-case.entity';

/**
 * 医療条件の重要度。
 *
 * REQUIRED:
 *   必須条件。施設が対応不可の場合は原則候補外。
 *
 * PREFERRED:
 *   希望条件。対応可能であればマッチング評価を上げる。
 *
 * NONE:
 *   条件として重視しない。
 */
export enum MedicalRequirementLevel {
  REQUIRED = 'REQUIRED',
  PREFERRED = 'PREFERRED',
  NONE = 'NONE',
}

/**
 * 施設探し案件ごとの医療条件。
 *
 * PlacementCase と MedicalConditionMaster の中間Entity。
 *
 * 例:
 * - 胃ろう: REQUIRED
 * - インスリン: PREFERRED
 * - 在宅酸素: NONE
 */
@Entity({
  name: 'case_medical_requirement',
})
@Index(
  'uq_case_medical_requirement_case_condition',
  ['placementCaseId', 'medicalConditionId'],
  {
    unique: true,
  },
)
@Index('idx_case_medical_requirement_placement_case_id', ['placementCaseId'])
@Index('idx_case_medical_requirement_medical_condition_id', [
  'medicalConditionId',
])
export class CaseMedicalRequirement {
  /**
   * 案件医療条件ID。
   */
  @PrimaryGeneratedColumn('uuid', {
    name: 'case_medical_requirement_id',
  })
  caseMedicalRequirementId: string;

  /**
   * 施設探し案件ID。
   */
  @Column({
    name: 'placement_case_id',
    type: 'uuid',
  })
  placementCaseId: string;

  /**
   * 医療条件マスタID。
   */
  @Column({
    name: 'medical_condition_id',
    type: 'uuid',
  })
  medicalConditionId: string;

  /**
   * 条件の重要度。
   */
  @Column({
    name: 'requirement_level',
    type: 'varchar',
    length: 30,
    default: MedicalRequirementLevel.NONE,
  })
  requirementLevel: MedicalRequirementLevel;

  /**
   * 補足メモ。
   *
   * 例:
   * 「朝夕2回」
   * 「自己注射不可」
   */
  @Column({
    type: 'text',
    nullable: true,
  })
  note: string | null;

  @CreateDateColumn({
    name: 'created_at',
    type: 'timestamptz',
  })
  createdAt: Date;

  @UpdateDateColumn({
    name: 'updated_at',
    type: 'timestamptz',
  })
  updatedAt: Date;

  /**
   * 対象案件。
   *
   * 案件削除時は医療条件も不要になるためCASCADE。
   */
  @ManyToOne(() => PlacementCase, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({
    name: 'placement_case_id',
    referencedColumnName: 'placementCaseId',
  })
  placementCase: Relation<PlacementCase>;

  /**
   * 医療条件マスタ。
   *
   * マスタは履歴整合性のため物理削除させない。
   */
  @ManyToOne(() => MedicalConditionMaster, {
    onDelete: 'RESTRICT',
  })
  @JoinColumn({
    name: 'medical_condition_id',
    referencedColumnName: 'medicalConditionId',
  })
  medicalCondition: Relation<MedicalConditionMaster>;
}
