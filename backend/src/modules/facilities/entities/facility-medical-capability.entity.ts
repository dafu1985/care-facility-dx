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
import { Facility } from './facility.entity';

/**
 * 施設側の医療条件受入可否。
 *
 * AVAILABLE:
 *   対応可能。
 *
 * CONSULTATION:
 *   条件次第で対応可能。要確認。
 *
 * UNAVAILABLE:
 *   対応不可。
 */
export enum FacilityMedicalCapabilityStatus {
  AVAILABLE = 'AVAILABLE',
  CONSULTATION = 'CONSULTATION',
  UNAVAILABLE = 'UNAVAILABLE',
}

/**
 * 施設ごとの医療受入条件。
 *
 * Facility と MedicalConditionMaster の中間Entity。
 *
 * 例:
 * - 胃ろう: AVAILABLE
 * - インスリン: CONSULTATION
 * - 人工呼吸器: UNAVAILABLE
 */
@Entity({
  name: 'facility_medical_capability',
})
@Index(
  'uq_facility_medical_capability_facility_condition',
  ['facilityId', 'medicalConditionId'],
  {
    unique: true,
  },
)
@Index('idx_facility_medical_capability_facility_id', ['facilityId'])
@Index('idx_facility_medical_capability_medical_condition_id', [
  'medicalConditionId',
])
export class FacilityMedicalCapability {
  /**
   * 施設医療受入条件ID。
   */
  @PrimaryGeneratedColumn('uuid', {
    name: 'facility_medical_capability_id',
  })
  facilityMedicalCapabilityId: string;

  /**
   * 施設ID。
   */
  @Column({
    name: 'facility_id',
    type: 'uuid',
  })
  facilityId: string;

  /**
   * 医療条件マスタID。
   */
  @Column({
    name: 'medical_condition_id',
    type: 'uuid',
  })
  medicalConditionId: string;

  /**
   * 受入可否。
   */
  @Column({
    type: 'varchar',
    length: 30,
    default: FacilityMedicalCapabilityStatus.CONSULTATION,
  })
  status: FacilityMedicalCapabilityStatus;

  /**
   * 補足メモ。
   *
   * 例:
   * 「日中のみ対応可」
   * 「看護師配置時間内のみ」
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
   * 対象施設。
   *
   * 施設削除時は受入条件も不要になるためCASCADE。
   */
  @ManyToOne(() => Facility, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({
    name: 'facility_id',
    referencedColumnName: 'facilityId',
  })
  facility: Relation<Facility>;

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
