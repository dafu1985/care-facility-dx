import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  OneToOne,
  PrimaryColumn,
  UpdateDateColumn,
} from 'typeorm';

import { User } from '../../users/entities/user.entity';

@Entity({ name: 'care_manager' })
export class CareManager {
  @PrimaryColumn({
    name: 'user_id',
    type: 'uuid',
  })
  userId: string;

  @Column({
    name: 'organization_name',
    type: 'varchar',
    length: 255,
  })
  organizationName: string;

  @Column({
    name: 'license_number',
    type: 'varchar',
    length: 100,
    nullable: true,
  })
  licenseNumber: string | null;

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

  @OneToOne(() => User, {
    onDelete: 'RESTRICT',
  })
  @JoinColumn({
    name: 'user_id',
    referencedColumnName: 'userId',
  })
  user: User;
}