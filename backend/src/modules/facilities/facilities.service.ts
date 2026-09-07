import {
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { Facility } from './entities/facility.entity';
import { FacilitySearchDto } from './dto/facility-search.dto';
import {
  FacilityListResponseDto,
  FacilityResponseDto,
} from './dto/facility-response.dto';
import { FacilityMapper } from './facility.mapper';

@Injectable()
export class FacilitiesService {
  constructor(
    @InjectRepository(Facility)
    private readonly facilityRepository: Repository<Facility>,
  ) {}

  async findAll(
    query: FacilitySearchDto,
  ): Promise<FacilityListResponseDto> {
    const queryBuilder = this.facilityRepository
      .createQueryBuilder('facility')
      .leftJoinAndSelect(
        'facility.facilityType',
        'facilityType',
      )
      .leftJoinAndSelect(
        'facility.availability',
        'availability',
      )
      .leftJoinAndSelect(
        'facility.pricing',
        'pricing',
      )
      .leftJoinAndSelect(
        'facility.requirement',
        'requirement',
      );

    // エリア
    if (query.area) {
      queryBuilder.andWhere(
        'facility.area = :area',
        {
          area: query.area,
        },
      );
    }

    // 施設種別
    if (query.facilityTypeId) {
      queryBuilder.andWhere(
        'facility.facility_type_id = :facilityTypeId',
        {
          facilityTypeId: query.facilityTypeId,
        },
      );
    }

    // 空き状況
    if (query.availability) {
      queryBuilder.andWhere(
        'availability.status = :availability',
        {
          availability: query.availability,
        },
      );
    }

    // 月額料金上限
    if (query.maxMonthlyCost !== undefined) {
      queryBuilder.andWhere(
        'pricing.monthly_cost_min <= :maxMonthlyCost',
        {
          maxMonthlyCost: query.maxMonthlyCost,
        },
      );
    }

    // 要介護度
    if (query.careLevel !== undefined) {
      queryBuilder
        .andWhere(
          `
          (
            requirement.min_care_level IS NULL
            OR requirement.min_care_level <= :careLevel
          )
          `,
          {
            careLevel: query.careLevel,
          },
        )
        .andWhere(
          `
          (
            requirement.max_care_level IS NULL
            OR requirement.max_care_level >= :careLevel
          )
          `,
          {
            careLevel: query.careLevel,
          },
        );
    }

    // 認知症対応
    if (query.dementiaAccepted !== undefined) {
      queryBuilder.andWhere(
        'requirement.dementia_accepted = :dementiaAccepted',
        {
          dementiaAccepted: query.dementiaAccepted,
        },
      );
    }

    // 医療ケア対応
    if (query.medicalCareAccepted !== undefined) {
      queryBuilder.andWhere(
        'requirement.medical_care_accepted = :medicalCareAccepted',
        {
          medicalCareAccepted: query.medicalCareAccepted,
        },
      );
    }

    // 車椅子対応
    if (query.wheelchairAccepted !== undefined) {
      queryBuilder.andWhere(
        'requirement.wheelchair_accepted = :wheelchairAccepted',
        {
          wheelchairAccepted: query.wheelchairAccepted,
        },
      );
    }

    // 看取り対応
    if (query.endOfLifeCare !== undefined) {
      queryBuilder.andWhere(
        'requirement.end_of_life_care = :endOfLifeCare',
        {
          endOfLifeCare: query.endOfLifeCare,
        },
      );
    }

    // 並び順
    queryBuilder
      .orderBy('facility.createdAt', 'DESC')
      .addOrderBy('facility.facilityId', 'ASC');

    // ページネーション
    const page = query.page ?? 1;
    const pageSize = query.pageSize ?? 20;

    queryBuilder
      .skip((page - 1) * pageSize)
      .take(pageSize);

    const [facilities, total] =
      await queryBuilder.getManyAndCount();

    return {
      items: FacilityMapper.toResponseList(facilities),
      page,
      pageSize,
      total,
    };
  }

  async findOne(
    facilityId: string,
  ): Promise<FacilityResponseDto> {
    const facility = await this.facilityRepository
      .createQueryBuilder('facility')
      .leftJoinAndSelect(
        'facility.facilityType',
        'facilityType',
      )
      .leftJoinAndSelect(
        'facility.availability',
        'availability',
      )
      .leftJoinAndSelect(
        'facility.pricing',
        'pricing',
      )
      .leftJoinAndSelect(
        'facility.requirement',
        'requirement',
      )
      .where(
        'facility.facilityId = :facilityId',
        {
          facilityId,
        },
      )
      .getOne();

    if (!facility) {
      throw new NotFoundException(
        'Facility not found',
      );
    }

    return FacilityMapper.toResponse(facility);
  }
}