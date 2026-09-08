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

import { Facility } from './facility.entity';

export enum AvailabilityStatus {
  AVAILABLE = 'AVAILABLE',
  FEW = 'FEW',
  FULL = 'FULL',
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

  @OneToOne(
    () => Facility,
    {
      onDelete: 'RESTRICT',
    },
  )
  @JoinColumn({
    name: 'facility_id',
    referencedColumnName: 'facilityId',
  })
  facility: Relation<Facility>;
}