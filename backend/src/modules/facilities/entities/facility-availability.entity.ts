import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

import type { Relation } from 'typeorm';

import { Facility } from './facility.entity';
import { User } from '../../users/entities/user.entity';

export enum AvailabilityStatus {
  /**
   * 空床あり。
   */
  AVAILABLE = 'AVAILABLE',

  /**
   * 空床残りわずか。
   *
   * 既存機能との互換性維持のため残す。
   */
  FEW = 'FEW',

  /**
   * 条件次第で受入可能。
   */
  CONSULTATION = 'CONSULTATION',

  /**
   * 満床。
   */
  FULL = 'FULL',

  /**
   * 一時的に受入停止。
   */
  SUSPENDED = 'SUSPENDED',

  /**
   * 空床状況不明。
   *
   * 既存機能との互換性維持のため残す。
   */
  UNKNOWN = 'UNKNOWN',
}

@Entity({
  name: 'facility_availability',
})
export class FacilityAvailability {
  @PrimaryGeneratedColumn('uuid', {
    name: 'availability_id',
  })
  availabilityId: string;

  @Column({
    name: 'facility_id',
    type: 'uuid',
  })
  facilityId: string;

  @Column({
    type: 'varchar',
    length: 30,
    default: AvailabilityStatus.UNKNOWN,
  })
  status: AvailabilityStatus;

  @Column({
    name: 'available_count',
    type: 'integer',
    nullable: true,
  })
  availableCount: number | null;

  /**
   * 男性向け空床数。
   */
  @Column({
    name: 'male_vacancy',
    type: 'integer',
    nullable: true,
  })
  maleVacancy: number | null;

  /**
   * 女性向け空床数。
   */
  @Column({
    name: 'female_vacancy',
    type: 'integer',
    nullable: true,
  })
  femaleVacancy: number | null;

  /**
   * 個室の空床数。
   */
  @Column({
    name: 'private_room_vacancy',
    type: 'integer',
    nullable: true,
  })
  privateRoomVacancy: number | null;

  @Column({
    name: 'available_from',
    type: 'date',
    nullable: true,
  })
  availableFrom: string | null;

  @Column({
    type: 'text',
    nullable: true,
  })
  note: string | null;

  @Column({
    name: 'updated_by',
    type: 'uuid',
    nullable: true,
  })
  updatedBy: string | null;

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
   * この空床情報を更新したユーザー。
   */
  @ManyToOne(() => User, {
    nullable: true,
    onDelete: 'SET NULL',
  })
  @JoinColumn({
    name: 'updated_by',
    referencedColumnName: 'userId',
  })
  updatedByUser: Relation<User> | null;

  /**
   * この空床情報が属する施設。
   */
  @OneToOne(() => Facility, (facility) => facility.availability, {
    onDelete: 'RESTRICT',
  })
  @JoinColumn({
    name: 'facility_id',
    referencedColumnName: 'facilityId',
  })
  facility: Relation<Facility>;
}
