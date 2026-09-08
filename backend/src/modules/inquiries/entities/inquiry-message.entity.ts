import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';

import type { Relation } from 'typeorm';

import { User } from '../../users/entities/user.entity';
import { Inquiry } from './inquiry.entity';

export enum InquiryMessageType {
  MESSAGE = 'MESSAGE',
  STATUS_CHANGE = 'STATUS_CHANGE',
  SYSTEM = 'SYSTEM',
}

@Entity({
  name: 'inquiry_message',
})
export class InquiryMessage {
  @PrimaryGeneratedColumn('uuid', {
    name: 'message_id',
  })
  messageId: string;

  @Column({
    name: 'inquiry_id',
    type: 'uuid',
  })
  inquiryId: string;

  @Column({
    name: 'sender_user_id',
    type: 'uuid',
    nullable: true,
  })
  senderUserId: string | null;

  @Column({
    type: 'varchar',
    length: 30,
    default: InquiryMessageType.MESSAGE,
  })
  type: InquiryMessageType;

  @Column({
    type: 'text',
  })
  body: string;

  @CreateDateColumn({
    name: 'created_at',
    type: 'timestamptz',
  })
  createdAt: Date;

  @ManyToOne(
    () => Inquiry,
    {
      onDelete: 'CASCADE',
    },
  )
  @JoinColumn({
    name: 'inquiry_id',
    referencedColumnName: 'inquiryId',
  })
  inquiry: Relation<Inquiry>;

  @ManyToOne(
    () => User,
    {
      onDelete: 'RESTRICT',
      nullable: true,
    },
  )
  @JoinColumn({
    name: 'sender_user_id',
    referencedColumnName: 'userId',
  })
  senderUser: Relation<User> | null;
}