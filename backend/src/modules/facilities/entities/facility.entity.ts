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

import { FacilityType } from './facility-type.entity';
import { FacilityAvailability } from './facility-availability.entity';
import { FacilityPricing } from './facility-pricing.entity';
import { FacilityRequirement } from './facility-requirement.entity';

export enum FacilityStatus {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
}

@Entity({ name: 'facility' })
export class Facility {
  @PrimaryGeneratedColumn('uuid', {
    name: 'facility_id',
  })
  facilityId: string;

  @Column({
    name: 'facility_type_id',
    type: 'uuid',
  })
  facilityTypeId: string;

  @Column({
    type: 'varchar',
    length: 255,
  })
  name: string;

  @Column({
    name: 'postal_code',
    type: 'varchar',
    length: 20,
    nullable: true,
  })
  postalCode: string | null;

  @Column({
    type: 'varchar',
    length: 500,
    nullable: true,
  })
  address: string | null;

  @Column({
    type: 'varchar',
    length: 100,
  })
  area: string;

  @Column({
    type: 'varchar',
    length: 30,
    nullable: true,
  })
  phone: string | null;

  @Column({
    type: 'text',
    nullable: true,
  })
  description: string | null;

  @Column({
    type: 'varchar',
    length: 30,
    default: FacilityStatus.ACTIVE,
  })
  status: FacilityStatus;

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

  @ManyToOne(() => FacilityType, {
    onDelete: 'RESTRICT',
  })
  @JoinColumn({
    name: 'facility_type_id',
    referencedColumnName: 'facilityTypeId',
  })
  facilityType: FacilityType;

  @OneToOne(
  () => FacilityAvailability,
  (availability) => availability.facility,
)
availability: FacilityAvailability;

@OneToOne(
  () => FacilityPricing,
  (pricing) => pricing.facility,
)
pricing: FacilityPricing;

@OneToOne(
  () => FacilityRequirement,
  (requirement) => requirement.facility,
)
requirement: FacilityRequirement;
}