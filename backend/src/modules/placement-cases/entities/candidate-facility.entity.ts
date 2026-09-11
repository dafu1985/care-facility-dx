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

import { Facility } from '../../facilities/entities/facility.entity';
import { PlacementCase } from './placement-case.entity';

export enum CandidateFacilityStatus {
  CONSIDERING = 'CONSIDERING',
  INQUIRING = 'INQUIRING',
  AVAILABLE = 'AVAILABLE',
  VISIT_SCHEDULED = 'VISIT_SCHEDULED',
  APPLIED = 'APPLIED',
  ACCEPTED = 'ACCEPTED',
  REJECTED = 'REJECTED',
  DECLINED = 'DECLINED',
}

@Entity({
  name: 'candidate_facility',
})
@Index(
  'uq_candidate_facility_case_facility',
  ['placementCaseId', 'facilityId'],
  {
    unique: true,
  },
)
@Index('idx_candidate_facility_placement_case_id', ['placementCaseId'])
@Index('idx_candidate_facility_facility_id', ['facilityId'])
@Index('idx_candidate_facility_status', ['status'])
export class CandidateFacility {
  @PrimaryGeneratedColumn('uuid', {
    name: 'candidate_facility_id',
  })
  candidateFacilityId: string;

  /**
   * 施設探し案件ID。
   */
  @Column({
    name: 'placement_case_id',
    type: 'uuid',
  })
  placementCaseId: string;

  /**
   * 候補施設ID。
   */
  @Column({
    name: 'facility_id',
    type: 'uuid',
  })
  facilityId: string;

  /**
   * マッチングスコア。
   *
   * 0〜100を想定。
   * マッチング機能実装前はnullを許容する。
   */
  @Column({
    name: 'match_score',
    type: 'integer',
    nullable: true,
  })
  matchScore: number | null;

  /**
   * 候補施設としての進捗状態。
   */
  @Column({
    type: 'varchar',
    length: 30,
    default: CandidateFacilityStatus.CONSIDERING,
  })
  status: CandidateFacilityStatus;

  /**
   * ケアマネジャー側のメモ。
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
   * 対象の施設探し案件。
   *
   * 案件削除時は候補施設情報も不要になるためCASCADE。
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
   * 候補となる施設。
   *
   * 候補として参照中の施設を不用意に削除させないためRESTRICT。
   */
  @ManyToOne(() => Facility, {
    onDelete: 'RESTRICT',
  })
  @JoinColumn({
    name: 'facility_id',
    referencedColumnName: 'facilityId',
  })
  facility: Relation<Facility>;
}
