import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

/**
 * 法人種別。
 */
export enum OrganizationType {
  SOCIAL_WELFARE = 'SOCIAL_WELFARE',
  MEDICAL = 'MEDICAL',
  COMPANY = 'COMPANY',
  NPO = 'NPO',
  OTHER = 'OTHER',
}

/**
 * 法人ステータス。
 */
export enum OrganizationStatus {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
}

/**
 * 法人Entity。
 *
 * 将来的に以下の上位概念として利用する。
 *
 * - Facility
 * - CareManagerOffice
 */
@Entity({ name: 'organization' })
@Index('idx_organization_name', ['name'])
export class Organization {
  /**
   * 法人ID。
   */
  @PrimaryGeneratedColumn('uuid', {
    name: 'organization_id',
  })
  organizationId: string;

  /**
   * 法人名。
   */
  @Column({
    type: 'varchar',
    length: 255,
  })
  name: string;

  /**
   * 法人種別。
   */
  @Column({
    name: 'organization_type',
    type: 'varchar',
    length: 50,
    nullable: true,
  })
  organizationType: OrganizationType | null;

  /**
   * 法人ステータス。
   */
  @Column({
    type: 'varchar',
    length: 30,
    default: OrganizationStatus.ACTIVE,
  })
  status: OrganizationStatus;

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
}
