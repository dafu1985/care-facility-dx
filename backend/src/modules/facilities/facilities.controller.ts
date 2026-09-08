import {
  Controller,
  Get,
  Param,
  ParseUUIDPipe,
  Query,
} from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiTags,
} from '@nestjs/swagger';

import { FacilitiesService } from './facilities.service';
import { FacilitySearchDto } from './dto/facility-search.dto';
import {
  FacilityListResponseDto,
  FacilityResponseDto,
} from './dto/facility-response.dto';

@ApiTags('facilities')
@Controller('facilities')
export class FacilitiesController {
  constructor(
    private readonly facilitiesService: FacilitiesService,
  ) {}

  @Get()
  @ApiOperation({
    summary: '介護施設一覧を検索する',
    description:
      'エリア、施設種別、空き状況、料金、要介護度、認知症対応などの条件で介護施設を検索します。',
  })
  @ApiOkResponse({
    description: '施設一覧の取得に成功',
    type: FacilityListResponseDto,
  })
  @ApiBadRequestResponse({
    description: '検索条件が不正',
  })
  async findAll(
    @Query() query: FacilitySearchDto,
  ): Promise<FacilityListResponseDto> {
    return this.facilitiesService.findAll(query);
  }

  @Get(':facilityId')
  @ApiOperation({
    summary: '介護施設の詳細を取得する',
    description:
      '指定された施設IDの基本情報、空き状況、料金、受入条件を取得します。',
  })
  @ApiParam({
    name: 'facilityId',
    description: '施設ID',
    example: '5ea06a45-7587-4198-b94c-56e0044399c7',
  })
  @ApiOkResponse({
    description: '施設詳細の取得に成功',
    type: FacilityResponseDto,
  })
  @ApiBadRequestResponse({
    description: '施設IDの形式が不正',
  })
  @ApiNotFoundResponse({
    description: '指定された施設が存在しない',
  })
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