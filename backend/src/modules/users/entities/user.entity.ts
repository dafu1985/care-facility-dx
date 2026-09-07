import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

export enum UserRole {
  CARE_MANAGER = 'CARE_MANAGER',
  FACILITY = 'FACILITY',
  ADMIN = 'ADMIN',
}

export enum UserStatus {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
  SUSPENDED = 'SUSPENDED',
}

@Entity({ name: 'app_user' })
export class User {
  @PrimaryGeneratedColumn('uuid', {
    name: 'user_id',
  })
  userId: string;

  @Column({
    type: 'varchar',
    length: 30,
  })
  role: UserRole;

  @Column({
    type: 'varchar',
    length: 255,
    unique: true,
  })
  email: string;

  @Column({
    name: 'password_hash',
    type: 'varchar',
    length: 255,
    nullable: true,
  })
  passwordHash: string | null;

  @Column({
    type: 'varchar',
    length: 30,
    default: UserStatus.ACTIVE,
  })
  status: UserStatus;

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