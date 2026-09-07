import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

import { User } from '../../users/entities/user.entity';
import { Facility } from '../../facilities/entities/facility.entity';
import { InquiryMessage } from './inquiry-message.entity';

export enum InquiryStatus {
  OPEN = 'OPEN',
  IN_PROGRESS = 'IN_PROGRESS',
  ANSWERED = 'ANSWERED',
  CLOSED = 'CLOSED',
  CANCELLED = 'CANCELLED',
}

@Entity({ name: 'inquiry' })
export class Inquiry {
  @PrimaryGeneratedColumn('uuid', {
    name: 'inquiry_id',
  })
  inquiryId: string;

  @Column({
    name: 'facility_id',
    type: 'uuid',
  })
  facilityId: string;

  @Column({
    name: 'created_by_user_id',
    type: 'uuid',
  })
  createdByUserId: string;

  @Column({
    type: 'varchar',
    length: 255,
  })
  subject: string;

  @Column({
    type: 'varchar',
    length: 30,
    default: InquiryStatus.OPEN,
  })
  status: InquiryStatus;

  @Column({
    name: 'last_message_at',
    type: 'timestamptz',
    nullable: true,
  })
  lastMessageAt: Date | null;

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

  @ManyToOne(() => Facility, {
    onDelete: 'RESTRICT',
  })
  @JoinColumn({
    name: 'facility_id',
    referencedColumnName: 'facilityId',
  })
  facility: Facility;

  @ManyToOne(() => User, {
    onDelete: 'RESTRICT',
  })
  @JoinColumn({
    name: 'created_by_user_id',
    referencedColumnName: 'userId',
  })
  createdByUser: User;

  @OneToMany(
  () => InquiryMessage,
  (message) => message.inquiry,
)
messages: InquiryMessage[];
}