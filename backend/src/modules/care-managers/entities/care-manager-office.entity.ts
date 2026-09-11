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

import { Organization } from '../../organizations/entities/organization.entity';

/**
 * 居宅介護支援事業所ステータス。
 */
export enum CareManagerOfficeStatus {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
}

/**
 * 居宅介護支援事業所Entity。
 *
 * Organization配下に属する事業所を表す。
 *
 * 将来的にはCareManagerがこのEntityへ所属する構造にする。
 * 現時点では既存CareManager.organizationNameは維持する。
 */
@Entity({ name: 'care_manager_office' })
@Index('idx_care_manager_office_name', ['name'])
@Index('idx_care_manager_office_organization_id', ['organizationId'])
export class CareManagerOffice {
  /**
   * 居宅介護支援事業所ID。
   */
  @PrimaryGeneratedColumn('uuid', {
    name: 'care_manager_office_id',
  })
  careManagerOfficeId: string;

  /**
   * 法人ID。
   */
  @Column({
    name: 'organization_id',
    type: 'uuid',
    nullable: true,
  })
  organizationId: string | null;

  /**
   * 事業所名。
   */
  @Column({
    type: 'varchar',
    length: 255,
  })
  name: string;

  /**
   * 介護保険事業所番号。
   *
   * MVPでは未登録も許容する。
   */
  @Column({
    name: 'office_number',
    type: 'varchar',
    length: 100,
    nullable: true,
  })
  officeNumber: string | null;

  /**
   * ステータス。
   */
  @Column({
    type: 'varchar',
    length: 30,
    default: CareManagerOfficeStatus.ACTIVE,
  })
  status: CareManagerOfficeStatus;

  /**
   * 作成日時。
   */
  @CreateDateColumn({
    name: 'created_at',
    type: 'timestamptz',
  })
  createdAt: Date;

  /**
   * 更新日時。
   */
  @UpdateDateColumn({
    name: 'updated_at',
    type: 'timestamptz',
  })
  updatedAt: Date;

  /**
   * 所属法人。
   *
   * 個人事業所なども考慮し、MVPではnullableとする。
   */
  @ManyToOne(() => Organization, {
    nullable: true,
    onDelete: 'RESTRICT',
  })
  @JoinColumn({
    name: 'organization_id',
    referencedColumnName: 'organizationId',
  })
  organization: Organization | null;
}
