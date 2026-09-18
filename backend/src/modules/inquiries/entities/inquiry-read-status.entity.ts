import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  Unique,
  UpdateDateColumn,
} from 'typeorm';

import { User } from '../../users/entities/user.entity';
import { Inquiry } from './inquiry.entity';

@Entity('inquiry_read_status')
@Unique('UQ_inquiry_read_status_inquiry_user', ['inquiryId', 'userId'])
export class InquiryReadStatus {
  @PrimaryGeneratedColumn('uuid', {
    name: 'inquiry_read_status_id',
  })
  inquiryReadStatusId: string;

  @Column('uuid', {
    name: 'inquiry_id',
  })
  inquiryId: string;

  @Column('uuid', {
    name: 'user_id',
  })
  userId: string;

  @Column('timestamptz', {
    name: 'last_read_at',
  })
  lastReadAt: Date;

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

  @ManyToOne(() => Inquiry, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({
    name: 'inquiry_id',
    referencedColumnName: 'inquiryId',
  })
  inquiry: Inquiry;

  @ManyToOne(() => User, {
    onDelete: 'RESTRICT',
  })
  @JoinColumn({
    name: 'user_id',
    referencedColumnName: 'userId',
  })
  user: User;
}