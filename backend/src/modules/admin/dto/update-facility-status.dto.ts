import { ApiProperty } from '@nestjs/swagger';
import { IsEnum } from 'class-validator';

import { FacilityStatus } from '../../facilities/entities/facility.entity';

export class UpdateFacilityStatusDto {
  @ApiProperty({
    description: '施設の利用ステータス',
    enum: FacilityStatus,
    example: FacilityStatus.INACTIVE,
  })
  @IsEnum(FacilityStatus)
  status: FacilityStatus;
}
