import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { User, UserRole } from '../users/entities/user.entity';
import { Facility } from '../facilities/entities/facility.entity';
import { FacilityMapper } from '../facilities/facility.mapper';
import {
  FacilityListResponseDto,
  FacilityResponseDto,
} from '../facilities/dto/facility-response.dto';
import { Inquiry, InquiryStatus } from '../inquiries/entities/inquiry.entity';

import { UpdateFacilityStatusDto } from './dto/update-facility-status.dto';

@Injectable()
export class AdminService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,

    @InjectRepository(Facility)
    private readonly facilityRepository: Repository<Facility>,

    @InjectRepository(Inquiry)
    private readonly inquiryRepository: Repository<Inquiry>,
  ) {}

  /**
   * 管理者ダッシュボードの集計情報を取得する。
   */
  async getDashboard() {
    const [facilityCount, careManagerCount, inquiryCount, openInquiryCount] =
      await Promise.all([
        this.facilityRepository.count(),

        this.userRepository.count({
          where: {
            role: UserRole.CARE_MANAGER,
          },
        }),

        this.inquiryRepository.count(),

        this.inquiryRepository.count({
          where: {
            status: InquiryStatus.OPEN,
          },
        }),
      ]);

    return {
      facilityCount,
      careManagerCount,
      inquiryCount,
      openInquiryCount,
    };
  }

  /**
   * 管理者向け施設一覧を取得する。
   *
   * ACTIVE / INACTIVE の両方を取得する。
   * 施設種別・空き状況・料金・受入条件を含める。
   */
  async getFacilities(): Promise<FacilityListResponseDto> {
    const facilities = await this.facilityRepository
      .createQueryBuilder('facility')
      .leftJoinAndSelect('facility.facilityType', 'facilityType')
      .leftJoinAndSelect('facility.availability', 'availability')
      .leftJoinAndSelect('facility.pricing', 'pricing')
      .leftJoinAndSelect('facility.requirement', 'requirement')
      .orderBy('facility.createdAt', 'DESC')
      .addOrderBy('facility.facilityId', 'ASC')
      .getMany();

    return {
      items: FacilityMapper.toResponseList(facilities),
      page: 1,
      pageSize: facilities.length,
      total: facilities.length,
    };
  }

  /**
   * 管理者向け施設詳細を取得する。
   *
   * ACTIVE / INACTIVE の両方を取得可能。
   */
  async getFacility(facilityId: string): Promise<FacilityResponseDto> {
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
   * 管理者による施設ステータス変更。
   *
   * ACTIVE   : 施設の利用を再開
   * INACTIVE : 施設の利用を停止
   *
   * 施設データは削除せず、ステータスのみ変更する。
   */
  async updateFacilityStatus(
    facilityId: string,
    dto: UpdateFacilityStatusDto,
  ): Promise<FacilityResponseDto> {
    const facility = await this.facilityRepository.findOne({
      where: { facilityId },
    });

    if (!facility) {
      throw new NotFoundException('Facility not found');
    }

    // ステータスが異なる場合のみ更新する
    if (facility.status !== dto.status) {
      facility.status = dto.status;

      await this.facilityRepository.save(facility);
    }

    // 更新後の施設情報を関連データとともに返す
    return this.getFacility(facilityId);
  }
}
