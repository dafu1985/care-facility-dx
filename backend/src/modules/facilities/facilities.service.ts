import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import type { AuthenticatedUser } from '../auth/jwt.strategy';
import { UserRole } from '../users/entities/user.entity';

import { Facility } from './entities/facility.entity';
import { FacilityAvailability } from './entities/facility-availability.entity';
import {
  FacilityStaff,
  FacilityStaffStatus,
} from './entities/facility-staff.entity';

import { FacilitySearchDto } from './dto/facility-search.dto';
import {
  FacilityListResponseDto,
  FacilityResponseDto,
} from './dto/facility-response.dto';
import { UpdateFacilityAvailabilityDto } from './dto/update-facility-availability.dto';
import { FacilityAvailabilityResponseDto } from './dto/facility-availability-response.dto';

import { FacilityMapper } from './facility.mapper';

@Injectable()
export class FacilitiesService {
  constructor(
    @InjectRepository(Facility)
    private readonly facilityRepository: Repository<Facility>,

    @InjectRepository(FacilityAvailability)
    private readonly facilityAvailabilityRepository: Repository<FacilityAvailability>,

    @InjectRepository(FacilityStaff)
    private readonly facilityStaffRepository: Repository<FacilityStaff>,
  ) {}

  /**
   * 施設一覧を取得する。
   */
  async findAll(query: FacilitySearchDto): Promise<FacilityListResponseDto> {
    const queryBuilder = this.facilityRepository
      .createQueryBuilder('facility')
      .leftJoinAndSelect('facility.facilityType', 'facilityType')
      .leftJoinAndSelect('facility.availability', 'availability')
      .leftJoinAndSelect('facility.pricing', 'pricing')
      .leftJoinAndSelect('facility.requirement', 'requirement');

    // エリア
    if (query.area) {
      queryBuilder.andWhere('facility.area = :area', {
        area: query.area,
      });
    }

    // 施設種別
    if (query.facilityTypeId) {
      queryBuilder.andWhere('facility.facility_type_id = :facilityTypeId', {
        facilityTypeId: query.facilityTypeId,
      });
    }

    // 空き状況
    if (query.availability) {
      queryBuilder.andWhere('availability.status = :availability', {
        availability: query.availability,
      });
    }

    // 月額料金上限
    if (query.maxMonthlyCost !== undefined) {
      queryBuilder.andWhere('pricing.monthly_cost_min <= :maxMonthlyCost', {
        maxMonthlyCost: query.maxMonthlyCost,
      });
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
      queryBuilder.andWhere('requirement.end_of_life_care = :endOfLifeCare', {
        endOfLifeCare: query.endOfLifeCare,
      });
    }

    // 並び順
    queryBuilder
      .orderBy('facility.createdAt', 'DESC')
      .addOrderBy('facility.facilityId', 'ASC');

    // ページネーション
    const page = query.page ?? 1;

    const pageSize = query.pageSize ?? 20;

    queryBuilder.skip((page - 1) * pageSize).take(pageSize);

    const [facilities, total] = await queryBuilder.getManyAndCount();

    return {
      items: FacilityMapper.toResponseList(facilities),
      page,
      pageSize,
      total,
    };
  }

  /**
   * 施設詳細を取得する。
   */
  async findOne(facilityId: string): Promise<FacilityResponseDto> {
    const facility = await this.facilityRepository
      .createQueryBuilder('facility')
      .leftJoinAndSelect('facility.facilityType', 'facilityType')
      .leftJoinAndSelect('facility.availability', 'availability')
      .leftJoinAndSelect('facility.pricing', 'pricing')
      .leftJoinAndSelect('facility.requirement', 'requirement')
      .where('facility.facilityId = :facilityId', {
        facilityId,
      })
      .getOne();

    if (!facility) {
      throw new NotFoundException('Facility not found');
    }

    return FacilityMapper.toResponse(facility);
  }

  /**
   * 施設の空き状況を更新する。
   *
   * FACILITY:
   * ACTIVE状態で所属している自施設のみ更新可能。
   *
   * ADMIN:
   * 全施設更新可能。
   *
   * CARE_MANAGER:
   * 更新不可。
   */
  async updateAvailability(
    facilityId: string,
    dto: UpdateFacilityAvailabilityDto,
    user: AuthenticatedUser,
  ): Promise<FacilityAvailabilityResponseDto> {
    /**
     * 施設自体の存在確認。
     */
    const facility = await this.facilityRepository.findOne({
      where: {
        facilityId,
      },
    });

    if (!facility) {
      throw new NotFoundException('Facility not found');
    }

    /**
     * FACILITYユーザーの場合、
     * facility_staffで所属確認を行う。
     */
    if (user.role === UserRole.FACILITY) {
      const facilityStaff = await this.facilityStaffRepository.findOne({
        where: {
          userId: user.userId,

          facilityId,

          status: FacilityStaffStatus.ACTIVE,
        },
      });

      if (!facilityStaff) {
        throw new ForbiddenException(
          'You do not have permission to update this facility',
        );
      }
    } else if (user.role !== UserRole.ADMIN) {
      /**
       * CARE_MANAGERなど、
       * FACILITY / ADMIN以外は禁止。
       */
      throw new ForbiddenException(
        'You are not allowed to update facility availability',
      );
    }

    /**
     * 現在の空き状況を取得。
     */
    let availability = await this.facilityAvailabilityRepository.findOne({
      where: {
        facilityId,
      },
    });

    /**
     * 空き状況レコードが未作成の場合は
     * 新規作成する。
     */
    if (!availability) {
      availability = this.facilityAvailabilityRepository.create({
        facilityId,
      });
    }

    /**
     * PATCHなので、
     * リクエストに含まれている項目だけ更新する。
     */
    if (dto.status !== undefined) {
      availability.status = dto.status;
    }

    if (dto.availableCount !== undefined) {
      availability.availableCount = dto.availableCount;
    }

    if (dto.availableFrom !== undefined) {
      availability.availableFrom = dto.availableFrom;
    }

    if (dto.note !== undefined) {
      availability.note = dto.note;
    }

    /**
     * 保存。
     */
    const saved = await this.facilityAvailabilityRepository.save(availability);

    return {
      availabilityId: saved.availabilityId,

      facilityId: saved.facilityId,

      status: saved.status,

      availableCount: saved.availableCount,

      availableFrom: saved.availableFrom,

      note: saved.note,

      updatedAt: saved.updatedAt,
    };
  }
}
