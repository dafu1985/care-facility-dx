import {
  IsBoolean,
  IsEnum,
  IsInt,
  IsOptional,
  IsString,
  IsUUID,
  Max,
  Min,
} from 'class-validator';
import { Transform, Type } from 'class-transformer';

import { AvailabilityStatus } from '../entities/facility-availability.entity';

export class FacilitySearchDto {
  @IsOptional()
  @IsString()
  area?: string;

  @IsOptional()
  @IsUUID()
  facilityTypeId?: string;

  @IsOptional()
  @IsEnum(AvailabilityStatus)
  availability?: AvailabilityStatus;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  maxMonthlyCost?: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(5)
  careLevel?: number;

  @IsOptional()
  @Transform(({ value }) => value === 'true')
  @IsBoolean()
  dementiaAccepted?: boolean;

  @IsOptional()
  @Transform(({ value }) => value === 'true')
  @IsBoolean()
  medicalCareAccepted?: boolean;

  @IsOptional()
  @Transform(({ value }) => value === 'true')
  @IsBoolean()
  wheelchairAccepted?: boolean;

  @IsOptional()
  @Transform(({ value }) => value === 'true')
  @IsBoolean()
  endOfLifeCare?: boolean;

  @IsOptional()
 @Type(() => Number)
 @IsInt()
 @Min(1)
 page: number = 1;

 @IsOptional()
 @Type(() => Number)
 @IsInt()
 @Min(1)
 @Max(100)
 pageSize: number = 20;
}