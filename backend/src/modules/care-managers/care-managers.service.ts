import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { CareManager } from './entities/care-manager.entity';

import { Inquiry, InquiryStatus } from '../inquiries/entities/inquiry.entity';

import { CareManagerDashboardResponse } from './dto/care-manager-dashboard-response.dto';

@Injectable()
export class CareManagersService {
  constructor(
    @InjectRepository(CareManager)
    private readonly careManagerRepository: Repository<CareManager>,

    @InjectRepository(Inquiry)
    private readonly inquiryRepository: Repository<Inquiry>,
  ) {}

  /**
   * ケアマネジャーダッシュボード取得。
   *
   * ログイン中ユーザーのuserIdを使用して、
   * ケアマネ情報と問い合わせ状況を取得する。
   *
   * @param userId ログインユーザーID
   */
  async getDashboard(userId: string): Promise<CareManagerDashboardResponse> {
    /**
     * ログイン中ユーザーに紐付く
     * ケアマネジャー情報を取得する。
     */
    const careManager = await this.careManagerRepository.findOne({
      where: {
        userId,
      },
    });

    if (!careManager) {
      throw new NotFoundException('Care manager not found.');
    }

    /**
     * ログイン中ユーザーが作成した
     * 問い合わせを新しい順に取得する。
     *
     * 施設名もダッシュボードで表示するため、
     * Facility relationも取得する。
     */
    const inquiries = await this.inquiryRepository.find({
      where: {
        createdByUserId: userId,
      },

      relations: {
        facility: true,
      },

      order: {
        createdAt: 'DESC',
      },
    });

    /**
     * 全問い合わせ件数。
     */
    const totalCount = inquiries.length;

    /**
     * 対応中の問い合わせ件数。
     *
     * OPEN:
     *   問い合わせ直後
     *
     * IN_PROGRESS:
     *   施設側が対応中
     */
    const openCount = inquiries.filter(
      (inquiry) =>
        inquiry.status === InquiryStatus.OPEN ||
        inquiry.status === InquiryStatus.IN_PROGRESS,
    ).length;

    /**
     * 回答済み問い合わせ件数。
     */
    const answeredCount = inquiries.filter(
      (inquiry) => inquiry.status === InquiryStatus.ANSWERED,
    ).length;

    /**
     * 最近の問い合わせ。
     *
     * ダッシュボードでは最新5件のみ表示する。
     */
    const recentInquiries = inquiries.slice(0, 5).map((inquiry) => ({
      inquiryId: inquiry.inquiryId,

      subject: inquiry.subject,

      status: inquiry.status,

      facilityId: inquiry.facilityId,

      facilityName: inquiry.facility?.name ?? '',

      lastMessageAt: inquiry.lastMessageAt?.toISOString() ?? null,

      createdAt: inquiry.createdAt.toISOString(),
    }));

    return {
      careManager: {
        userId: careManager.userId,

        organizationName: careManager.organizationName,

        licenseNumber: careManager.licenseNumber,
      },

      inquirySummary: {
        totalCount,

        openCount,

        answeredCount,

        recentInquiries,
      },
    };
  }
}
