import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import type { AuthenticatedUser } from '../auth/jwt.strategy';
import { UserRole } from '../users/entities/user.entity';

import { FacilityAvailabilityResponseDto } from './dto/facility-availability-response.dto';
import { FacilityRequirementResponseDto } from './dto/facility-requirement-response.dto';
import {
  FacilityListResponseDto,
  FacilityResponseDto,
} from './dto/facility-response.dto';
import { FacilitySearchDto } from './dto/facility-search.dto';
import { UpdateFacilityAvailabilityDto } from './dto/update-facility-availability.dto';
import { UpdateFacilityRequirementDto } from './dto/update-facility-requirement.dto';

import { FacilityAvailability } from './entities/facility-availability.entity';
import { FacilityRequirement } from './entities/facility-requirement.entity';
import {
  FacilityStaff,
  FacilityStaffStatus,
} from './entities/facility-staff.entity';
import { Facility } from './entities/facility.entity';

import { FacilityMapper } from './facility.mapper';

import { FacilityPricing } from './entities/facility-pricing.entity';

import { UpdateFacilityPricingDto } from './dto/update-facility-pricing.dto';

import { FacilityPricingResponseDto } from './dto/facility-pricing-response.dto';
import { UpdateFacilityDto } from './dto/update-facility.dto';

@Injectable()
export class FacilitiesService {
  constructor(
    @InjectRepository(Facility)
    private readonly facilityRepository: Repository<Facility>,

    @InjectRepository(FacilityAvailability)
    private readonly facilityAvailabilityRepository: Repository<FacilityAvailability>,

    @InjectRepository(FacilityStaff)
    private readonly facilityStaffRepository: Repository<FacilityStaff>,

    @InjectRepository(FacilityRequirement)
    private readonly facilityRequirementRepository: Repository<FacilityRequirement>,

    @InjectRepository(FacilityPricing)
    private readonly facilityPricingRepository: Repository<FacilityPricing>,
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
   * 施設基本情報を更新する。
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
  async updateFacility(
    facilityId: string,
    dto: UpdateFacilityDto,
    user: AuthenticatedUser,
  ): Promise<FacilityResponseDto> {
    /**
     * 更新対象施設を取得。
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
     * 既存の共通認可を利用。
     */
    await this.assertFacilityUpdateAccess(facilityId, user, 'facility');

    /**
     * PATCHなので指定項目のみ更新する。
     */
    if (dto.facilityTypeId !== undefined) {
      facility.facilityTypeId = dto.facilityTypeId;
    }

    if (dto.name !== undefined) {
      facility.name = dto.name;
    }

    if (dto.postalCode !== undefined) {
      facility.postalCode = dto.postalCode;
    }

    if (dto.address !== undefined) {
      facility.address = dto.address;
    }

    if (dto.area !== undefined) {
      facility.area = dto.area;
    }

    if (dto.phone !== undefined) {
      facility.phone = dto.phone;
    }

    if (dto.description !== undefined) {
      facility.description = dto.description;
    }

    await this.facilityRepository.save(facility);

    /**
     * Relation込みの最新状態を返す。
     */
    return this.findOne(facilityId);
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
     * 施設存在確認。
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
     * 更新権限確認。
     */
    await this.assertFacilityUpdateAccess(facilityId, user, 'availability');

    /**
     * 現在の空き状況を取得。
     */
    let availability = await this.facilityAvailabilityRepository.findOne({
      where: {
        facilityId,
      },
    });

    /**
     * 未作成の場合は新規作成。
     */
    if (!availability) {
      availability = this.facilityAvailabilityRepository.create({
        facilityId,
      });
    }

    /**
     * PATCHのため、
     * 指定された項目だけ更新する。
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

  /**
   * 施設の受入条件を更新する。
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
  async updateRequirement(
    facilityId: string,
    dto: UpdateFacilityRequirementDto,
    user: AuthenticatedUser,
  ): Promise<FacilityRequirementResponseDto> {
    /**
     * 施設存在確認。
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
     * 更新権限確認。
     */
    await this.assertFacilityUpdateAccess(facilityId, user, 'requirement');

    /**
     * 現在の受入条件を取得。
     */
    let requirement = await this.facilityRequirementRepository.findOne({
      where: {
        facilityId,
      },
    });

    /**
     * 未作成なら新規作成。
     */
    if (!requirement) {
      requirement = this.facilityRequirementRepository.create({
        facilityId,
      });
    }

    /**
     * PATCHのため、
     * 指定された項目だけ更新する。
     */
    if (dto.minCareLevel !== undefined) {
      requirement.minCareLevel = dto.minCareLevel;
    }

    if (dto.maxCareLevel !== undefined) {
      requirement.maxCareLevel = dto.maxCareLevel;
    }

    if (dto.dementiaAccepted !== undefined) {
      requirement.dementiaAccepted = dto.dementiaAccepted;
    }

    if (dto.medicalCareAccepted !== undefined) {
      requirement.medicalCareAccepted = dto.medicalCareAccepted;
    }

    if (dto.wheelchairAccepted !== undefined) {
      requirement.wheelchairAccepted = dto.wheelchairAccepted;
    }

    if (dto.endOfLifeCare !== undefined) {
      requirement.endOfLifeCare = dto.endOfLifeCare;
    }

    if (dto.note !== undefined) {
      requirement.note = dto.note;
    }

    /**
     * 業務ルール:
     *
     * 最低要介護度が最高要介護度を
     * 上回る状態は禁止する。
     */
    if (
      requirement.minCareLevel !== null &&
      requirement.minCareLevel !== undefined &&
      requirement.maxCareLevel !== null &&
      requirement.maxCareLevel !== undefined &&
      requirement.minCareLevel > requirement.maxCareLevel
    ) {
      throw new BadRequestException(
        'minCareLevel must be less than or equal to maxCareLevel',
      );
    }

    const saved = await this.facilityRequirementRepository.save(requirement);

    return {
      requirementId: saved.requirementId,

      facilityId: saved.facilityId,

      minCareLevel: saved.minCareLevel,

      maxCareLevel: saved.maxCareLevel,

      dementiaAccepted: saved.dementiaAccepted,

      medicalCareAccepted: saved.medicalCareAccepted,

      wheelchairAccepted: saved.wheelchairAccepted,

      endOfLifeCare: saved.endOfLifeCare,

      note: saved.note,

      updatedAt: saved.updatedAt,
    };
  }

  /**
   * 施設の料金情報を更新する。
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
  async updatePricing(
    facilityId: string,
    dto: UpdateFacilityPricingDto,
    user: AuthenticatedUser,
  ): Promise<FacilityPricingResponseDto> {
    const facility = await this.facilityRepository.findOne({
      where: {
        facilityId,
      },
    });

    if (!facility) {
      throw new NotFoundException('Facility not found');
    }

    await this.assertFacilityUpdateAccess(facilityId, user, 'pricing');

    let pricing = await this.facilityPricingRepository.findOne({
      where: {
        facilityId,
      },
    });

    if (!pricing) {
      pricing = this.facilityPricingRepository.create({
        facilityId,
        monthlyCostMin: 0,
        monthlyCostMax: 0,
        entranceFee: 0,
        note: null,
      });
    }

    if (dto.monthlyCostMin !== undefined) {
      pricing.monthlyCostMin = dto.monthlyCostMin;
    }

    if (dto.monthlyCostMax !== undefined) {
      pricing.monthlyCostMax = dto.monthlyCostMax;
    }

    if (dto.entranceFee !== undefined) {
      pricing.entranceFee = dto.entranceFee;
    }

    if (dto.note !== undefined) {
      pricing.note = dto.note;
    }

    if (pricing.monthlyCostMin > pricing.monthlyCostMax) {
      throw new BadRequestException(
        'monthlyCostMin must be less than or equal to monthlyCostMax',
      );
    }

    const saved = await this.facilityPricingRepository.save(pricing);

    return {
      pricingId: saved.pricingId,
      facilityId: saved.facilityId,
      monthlyCostMin: saved.monthlyCostMin,
      monthlyCostMax: saved.monthlyCostMax,
      entranceFee: saved.entranceFee,
      note: saved.note,
      updatedAt: saved.updatedAt,
    };
  }

  /**
   * 施設更新系API共通の認可処理。
   *
   * FACILITY:
   * ACTIVE状態で対象施設へ所属している場合のみ許可。
   *
   * ADMIN:
   * 全施設を更新可能。
   *
   * その他:
   * 更新不可。
   */
  private async assertFacilityUpdateAccess(
    facilityId: string,
    user: AuthenticatedUser,
    resource: 'availability' | 'requirement' | 'pricing' | 'facility',
  ): Promise<void> {
    /**
     * ADMINは所属確認不要。
     */
    if (user.role === UserRole.ADMIN) {
      return;
    }

    /**
     * FACILITYは所属施設を確認。
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

      return;
    }

    /**
     * CARE_MANAGERなどは更新不可。
     */
    if (resource === 'availability') {
      throw new ForbiddenException(
        'You are not allowed to update facility availability',
      );
    }

    if (resource === 'requirement') {
      throw new ForbiddenException(
        'You are not allowed to update facility requirements',
      );
    }

    if (resource === 'pricing') {
      throw new ForbiddenException(
        'You are not allowed to update facility pricing',
      );
    }

    throw new ForbiddenException(
      'You are not allowed to update facility information',
    );
  }
}
