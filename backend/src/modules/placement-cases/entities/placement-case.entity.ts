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

import { CareManager } from '../../care-managers/entities/care-manager.entity';

/**
 * 施設探し案件ステータス。
 */
export enum PlacementCaseStatus {
  /**
   * 施設候補を検索・検討中。
   */
  SEARCHING = 'SEARCHING',

  /**
   * 施設へ問い合わせ中。
   */
  INQUIRING = 'INQUIRING',

  /**
   * 見学調整・見学中。
   */
  VISITING = 'VISITING',

  /**
   * 入所申込中。
   */
  APPLYING = 'APPLYING',

  /**
   * 入所調整完了。
   */
  COMPLETED = 'COMPLETED',

  /**
   * 案件中止。
   */
  CANCELLED = 'CANCELLED',
}

/**
 * 施設探し案件Entity。
 *
 * ケアマネジャーが担当する1利用者分の
 * 「施設選定〜入所調整」を管理する単位。
 *
 * MVPでは利用者氏名・住所・電話番号などの
 * 直接的な個人識別情報は保持しない。
 */
@Entity({
  name: 'placement_case',
})
@Index('uq_placement_case_case_code', ['caseCode'], {
  unique: true,
})
@Index('idx_placement_case_care_manager_id', ['careManagerId'])
@Index('idx_placement_case_status', ['status'])
export class PlacementCase {
  /**
   * 案件ID。
   */
  @PrimaryGeneratedColumn('uuid', {
    name: 'placement_case_id',
  })
  placementCaseId: string;

  /**
   * 担当ケアマネジャーID。
   *
   * CareManager.userIdを参照する。
   */
  @Column({
    name: 'care_manager_id',
    type: 'uuid',
  })
  careManagerId: string;

  /**
   * 案件管理コード。
   *
   * 例:
   * NIG-000001
   */
  @Column({
    name: 'case_code',
    type: 'varchar',
    length: 50,
  })
  caseCode: string;

  /**
   * 案件ステータス。
   */
  @Column({
    type: 'varchar',
    length: 30,
    default: PlacementCaseStatus.SEARCHING,
  })
  status: PlacementCaseStatus;

  /**
   * 入所希望日。
   *
   * 未定の場合があるためnullable。
   */
  @Column({
    name: 'desired_move_in_date',
    type: 'date',
    nullable: true,
  })
  desiredMoveInDate: string | null;

  /**
   * 緊急度。
   *
   * 緊急度の選択肢は今後のヒアリングで
   * 変更する可能性があるため、
   * 現時点ではenum化せず文字列として保持する。
   */
  @Column({
    type: 'varchar',
    length: 30,
    nullable: true,
  })
  urgency: string | null;

  /**
   * 案件メモ。
   *
   * 利用者氏名などの直接的な個人情報は
   * 原則として入力しない運用を想定する。
   */
  @Column({
    type: 'text',
    nullable: true,
  })
  note: string | null;

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
   * 担当ケアマネジャー。
   */
  @ManyToOne(() => CareManager, {
    onDelete: 'RESTRICT',
  })
  @JoinColumn({
    name: 'care_manager_id',
    referencedColumnName: 'userId',
  })
  careManager: Relation<CareManager>;
}
