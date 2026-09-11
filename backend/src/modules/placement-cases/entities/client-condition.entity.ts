import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  OneToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

import type { Relation } from 'typeorm';

import { PlacementCase } from './placement-case.entity';

/**
 * 性別。
 */
export enum ClientGender {
  MALE = 'MALE',
  FEMALE = 'FEMALE',
  OTHER = 'OTHER',
  UNKNOWN = 'UNKNOWN',
}

/**
 * 利用者条件Entity。
 *
 * 施設探し案件に対して1件の利用者条件を保持する。
 *
 * MVPでは氏名・住所・電話番号・生年月日などの
 * 直接的な個人識別情報は保持しない。
 */
@Entity({
  name: 'client_condition',
})
export class ClientCondition {
  /**
   * 利用者条件ID。
   */
  @PrimaryGeneratedColumn('uuid', {
    name: 'client_condition_id',
  })
  clientConditionId: string;

  /**
   * 施設探し案件ID。
   *
   * PlacementCaseとは1対1。
   */
  @Column({
    name: 'placement_case_id',
    type: 'uuid',
  })
  placementCaseId: string;

  /**
   * 年齢層。
   *
   * 例:
   * 60s
   * 70s
   * 80s
   * 90s
   *
   * ヒアリングで区分変更の可能性があるため、
   * 現時点ではenum化しない。
   */
  @Column({
    name: 'age_group',
    type: 'varchar',
    length: 30,
    nullable: true,
  })
  ageGroup: string | null;

  /**
   * 性別。
   */
  @Column({
    type: 'varchar',
    length: 20,
    nullable: true,
  })
  gender: ClientGender | null;

  /**
   * 要介護度。
   *
   * 例:
   * SUPPORT_1
   * SUPPORT_2
   * CARE_1
   * CARE_2
   * CARE_3
   * CARE_4
   * CARE_5
   *
   * 現時点では文字列として保持する。
   */
  @Column({
    name: 'care_level',
    type: 'varchar',
    length: 30,
    nullable: true,
  })
  careLevel: string | null;

  /**
   * 月額予算上限。
   *
   * 円単位。
   */
  @Column({
    name: 'budget_max',
    type: 'integer',
    nullable: true,
  })
  budgetMax: number | null;

  /**
   * 希望地域。
   *
   * MVPでは新潟市内の区名や地域名を
   * 文字列として保持する。
   */
  @Column({
    name: 'desired_area',
    type: 'varchar',
    length: 255,
    nullable: true,
  })
  desiredArea: string | null;

  /**
   * 生活保護利用有無。
   *
   * nullは未確認を表す。
   */
  @Column({
    name: 'public_assistance',
    type: 'boolean',
    nullable: true,
  })
  publicAssistance: boolean | null;

  /**
   * 身元保証人の有無。
   *
   * nullは未確認を表す。
   */
  @Column({
    name: 'guarantor_available',
    type: 'boolean',
    nullable: true,
  })
  guarantorAvailable: boolean | null;

  /**
   * 認知症の有無。
   *
   * nullは未確認を表す。
   */
  @Column({
    type: 'boolean',
    nullable: true,
  })
  dementia: boolean | null;

  /**
   * 看取り対応を希望するか。
   *
   * nullは未確認を表す。
   */
  @Column({
    name: 'end_of_life_care',
    type: 'boolean',
    nullable: true,
  })
  endOfLifeCare: boolean | null;

  /**
   * 入所希望日。
   *
   * PlacementCaseにも管理用の希望日を持つが、
   * 利用者条件としても保持する。
   */
  @Column({
    name: 'desired_move_in_date',
    type: 'date',
    nullable: true,
  })
  desiredMoveInDate: string | null;

  /**
   * 作成日時。
   */
  @CreateDateColumn({
    name: 'created_at',
    type: 'timestamptz',
  })
  createdAt: Date;

  /**
   * 更新日時。
   */
  @UpdateDateColumn({
    name: 'updated_at',
    type: 'timestamptz',
  })
  updatedAt: Date;

  /**
   * 対象となる施設探し案件。
   */
  @OneToOne(() => PlacementCase, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({
    name: 'placement_case_id',
    referencedColumnName: 'placementCaseId',
  })
  placementCase: Relation<PlacementCase>;
}
