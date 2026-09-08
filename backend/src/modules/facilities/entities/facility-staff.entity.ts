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

import { User } from '../../users/entities/user.entity';
import { Facility } from './facility.entity';

export enum FacilityStaffRole {
  MANAGER = 'MANAGER',
  STAFF = 'STAFF',
}

export enum FacilityStaffStatus {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
}

@Entity({
  name: 'facility_staff',
})
@Index(
  'UQ_facility_staff_user_facility',
  [
    'userId',
    'facilityId',
  ],
  {
    unique: true,
  },
)
export class FacilityStaff {
  @PrimaryGeneratedColumn('uuid', {
    name: 'facility_staff_id',
  })
  facilityStaffId: string;

  @Column({
    name: 'user_id',
    type: 'uuid',
  })
  userId: string;

  @Column({
    name: 'facility_id',
    type: 'uuid',
  })
  facilityId: string;

  @Column({
    type: 'varchar',
    length: 30,
    default: FacilityStaffRole.STAFF,
  })
  role: FacilityStaffRole;

  @Column({
    type: 'varchar',
    length: 30,
    default: FacilityStaffStatus.ACTIVE,
  })
  status: FacilityStaffStatus;

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

  @ManyToOne(
    () => User,
    {
      onDelete: 'RESTRICT',
    },
  )
  @JoinColumn({
    name: 'user_id',
    referencedColumnName: 'userId',
  })
  user: User;

  @ManyToOne(
    () => Facility,
    {
      onDelete: 'RESTRICT',
    },
  )
  @JoinColumn({
    name: 'facility_id',
    referencedColumnName: 'facilityId',
  })
  facility: Facility;
}