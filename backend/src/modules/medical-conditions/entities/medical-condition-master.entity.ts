import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

/**
 * 医療条件マスタコード。
 *
 * ケアマネ側の利用者条件と、
 * 施設側の受入可否で共通利用する。
 */
export enum MedicalConditionCode {
  GASTROSTOMY = 'GASTROSTOMY',
  NASOGASTRIC_FEEDING = 'NASOGASTRIC_FEEDING',
  IVH = 'IVH',
  INSULIN = 'INSULIN',
  HOME_OXYGEN = 'HOME_OXYGEN',
  SUCTION = 'SUCTION',
  DIALYSIS = 'DIALYSIS',
  STOMA = 'STOMA',
  URINARY_CATHETER = 'URINARY_CATHETER',
  TRACHEOSTOMY = 'TRACHEOSTOMY',
  VENTILATOR = 'VENTILATOR',
  PRESSURE_ULCER = 'PRESSURE_ULCER',
  TERMINAL_CARE = 'TERMINAL_CARE',
}

/**
 * 医療条件マスタ。
 *
 * 例:
 * - 胃ろう
 * - インスリン
 * - 在宅酸素
 * - 吸引
 *
 * 医療条件を文字列で各テーブルに直接持たせず、
 * マスタとして共通管理する。
 */
@Entity({
  name: 'medical_condition_master',
})
@Index('uq_medical_condition_master_code', ['code'], {
  unique: true,
})
export class MedicalConditionMaster {
  /**
   * 医療条件ID。
   */
  @PrimaryGeneratedColumn('uuid', {
    name: 'medical_condition_id',
  })
  medicalConditionId: string;

  /**
   * システム内部コード。
   */
  @Column({
    type: 'varchar',
    length: 50,
  })
  code: MedicalConditionCode;

  /**
   * 表示名。
   *
   * 例:
   * 胃ろう
   * インスリン
   * 在宅酸素
   */
  @Column({
    type: 'varchar',
    length: 100,
  })
  name: string;

  /**
   * 表示順。
   */
  @Column({
    name: 'display_order',
    type: 'integer',
    default: 0,
  })
  displayOrder: number;

  /**
   * 利用可能かどうか。
   *
   * 将来マスタ項目を廃止する場合でも、
   * 物理削除せず無効化できるようにする。
   */
  @Column({
    name: 'is_active',
    type: 'boolean',
    default: true,
  })
  isActive: boolean;

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
}
