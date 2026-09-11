import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  Index,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

import type { Relation } from 'typeorm';

import { Facility } from '../../facilities/entities/facility.entity';
import { User } from '../../users/entities/user.entity';

import { InquiryMessage } from './inquiry-message.entity';
import { CandidateFacility } from '../../placement-cases/entities/candidate-facility.entity';
import { PlacementCase } from '../../placement-cases/entities/placement-case.entity';

export enum InquiryStatus {
  OPEN = 'OPEN',

  IN_PROGRESS = 'IN_PROGRESS',

  ANSWERED = 'ANSWERED',

  CLOSED = 'CLOSED',

  CANCELLED = 'CANCELLED',
}

@Entity({
  name: 'inquiry',
})
@Index('idx_inquiry_placement_case_id', ['placementCaseId'])
@Index('idx_inquiry_candidate_facility_id', ['candidateFacilityId'])
export class Inquiry {
  @PrimaryGeneratedColumn('uuid', {
    name: 'inquiry_id',
  })
  inquiryId: string;

  @Column({
    name: 'facility_id',
    type: 'uuid',
  })
  facilityId: string;

  @Column({
    name: 'created_by_user_id',
    type: 'uuid',
  })
  createdByUserId: string;

  /**
   * この問い合わせが属する施設探し案件。
   *
   * 既存問い合わせとの互換性を維持するためnullable。
   */
  @Column({
    name: 'placement_case_id',
    type: 'uuid',
    nullable: true,
  })
  placementCaseId: string | null;

  /**
   * この問い合わせの対象となる候補施設。
   *
   * 既存問い合わせとの互換性を維持するためnullable。
   */
  @Column({
    name: 'candidate_facility_id',
    type: 'uuid',
    nullable: true,
  })
  candidateFacilityId: string | null;

  @Column({
    type: 'varchar',
    length: 255,
  })
  subject: string;

  @Column({
    type: 'varchar',
    length: 30,
    default: InquiryStatus.OPEN,
  })
  status: InquiryStatus;

  @Column({
    name: 'last_message_at',
    type: 'timestamptz',
    nullable: true,
  })
  lastMessageAt: Date | null;

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
   * 問い合わせ先施設。
   */
  @ManyToOne(() => Facility, {
    onDelete: 'RESTRICT',
  })
  @JoinColumn({
    name: 'facility_id',
    referencedColumnName: 'facilityId',
  })
  facility: Relation<Facility>;

  /**
   * 問い合わせが属する施設探し案件。
   *
   * 案件が削除されても問い合わせ履歴自体は保持するためSET NULL。
   */
  @ManyToOne(() => PlacementCase, {
    nullable: true,
    onDelete: 'SET NULL',
  })
  @JoinColumn({
    name: 'placement_case_id',
    referencedColumnName: 'placementCaseId',
  })
  placementCase: Relation<PlacementCase> | null;

  /**
   * 問い合わせ対象の候補施設。
   *
   * 候補施設が削除されても問い合わせ履歴は保持するためSET NULL。
   */
  @ManyToOne(() => CandidateFacility, {
    nullable: true,
    onDelete: 'SET NULL',
  })
  @JoinColumn({
    name: 'candidate_facility_id',
    referencedColumnName: 'candidateFacilityId',
  })
  candidateFacility: Relation<CandidateFacility> | null;

  /**
   * 問い合わせ作成者。
   */
  @ManyToOne(() => User, {
    onDelete: 'RESTRICT',
  })
  @JoinColumn({
    name: 'created_by_user_id',
    referencedColumnName: 'userId',
  })
  createdByUser: Relation<User>;

  /**
   * 問い合わせに紐づくメッセージ一覧。
   */
  @OneToMany(() => InquiryMessage, (message) => message.inquiry)
  messages: Relation<InquiryMessage[]>;
}
