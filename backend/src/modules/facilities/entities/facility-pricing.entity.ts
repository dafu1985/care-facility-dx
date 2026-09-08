import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  OneToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

import type { Relation } from 'typeorm';

import { Facility } from './facility.entity';

@Entity({
  name: 'facility_pricing',
})
export class FacilityPricing {
  @PrimaryGeneratedColumn('uuid', {
    name: 'pricing_id',
  })
  pricingId: string;

  @Column({
    name: 'facility_id',
    type: 'uuid',
  })
  facilityId: string;

  @Column({
    name: 'monthly_cost_min',
    type: 'integer',
  })
  monthlyCostMin: number;

  @Column({
    name: 'monthly_cost_max',
    type: 'integer',
  })
  monthlyCostMax: number;

  @Column({
    name: 'entrance_fee',
    type: 'integer',
  })
  entranceFee: number;

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

  @OneToOne(
    () => Facility,
    {
      onDelete: 'RESTRICT',
    },
  )
  @JoinColumn({
    name: 'facility_id',
    referencedColumnName: 'facilityId',
  })
  facility: Relation<Facility>;
}