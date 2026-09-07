import {
  Controller,
  Get,
  Param,
  ParseUUIDPipe,
  Query,
} from '@nestjs/common';

import { FacilitiesService } from './facilities.service';
import { FacilitySearchDto } from './dto/facility-search.dto';
import {
  FacilityListResponseDto,
  FacilityResponseDto,
} from './dto/facility-response.dto';

@Controller('facilities')
export class FacilitiesController {
  constructor(
    private readonly facilitiesService: FacilitiesService,
  ) {}

  @Get()
  async findAll(
    @Query() query: FacilitySearchDto,
  ): Promise<FacilityListResponseDto> {
    return this.facilitiesService.findAll(query);
  }

  @Get(':facilityId')
  async findOne(
    @Param(
      'facilityId',
      new ParseUUIDPipe(),
    )
    facilityId: string,
  ): Promise<FacilityResponseDto> {
    return this.facilitiesService.findOne(facilityId);
  }
}