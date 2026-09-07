import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  OneToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

import { Facility } from './facility.entity';

@Entity({ name: 'facility_requirement' })
export class FacilityRequirement {
  @PrimaryGeneratedColumn('uuid', {
    name: 'requirement_id',
  })
  requirementId: string;

  @Column({
    name: 'facility_id',
    type: 'uuid',
  })
  facilityId: string;

  @Column({
    name: 'min_care_level',
    type: 'integer',
    nullable: true,
  })
  minCareLevel: number | null;

  @Column({
    name: 'max_care_level',
    type: 'integer',
    nullable: true,
  })
  maxCareLevel: number | null;

  @Column({
    name: 'dementia_accepted',
    type: 'boolean',
    default: false,
  })
  dementiaAccepted: boolean;

  @Column({
    name: 'medical_care_accepted',
    type: 'boolean',
    default: false,
  })
  medicalCareAccepted: boolean;

  @Column({
    name: 'wheelchair_accepted',
    type: 'boolean',
    default: true,
  })
  wheelchairAccepted: boolean;

  @Column({
    name: 'end_of_life_care',
    type: 'boolean',
    default: false,
  })
  endOfLifeCare: boolean;

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

  @OneToOne(() => Facility, {
    onDelete: 'RESTRICT',
  })
  @JoinColumn({
    name: 'facility_id',
    referencedColumnName: 'facilityId',
  })
  facility: Facility;
}