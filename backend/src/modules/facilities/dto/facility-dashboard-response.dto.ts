import { ApiProperty } from '@nestjs/swagger';

import { InquiryStatus } from '../../inquiries/entities/inquiry.entity';

import { FacilityResponseDto } from './facility-response.dto';

/**
 * ダッシュボード表示用の最近の問い合わせ。
 */
export class FacilityDashboardRecentInquiryDto {
  @ApiProperty({
    description: '問い合わせID',
    example: '5ddaf599-93c5-40ec-bc1e-ced92540882b',
  })
  inquiryId: string;

  @ApiProperty({
    description: '問い合わせ件名',
    example: '空き状況について',
  })
  subject: string;

  @ApiProperty({
    description: '問い合わせステータス',
    enum: InquiryStatus,
    example: InquiryStatus.OPEN,
  })
  status: InquiryStatus;

  @ApiProperty({
    description: '最終メッセージ日時',
    example: '2026-09-09T01:30:00.000Z',
    nullable: true,
  })
  lastMessageAt: Date | null;
}

/**
 * ダッシュボード用問い合わせサマリー。
 */
export class FacilityDashboardInquirySummaryDto {
  /**
   * 対応中問い合わせ件数。
   *
   * OPEN / IN_PROGRESS を対象とする。
   */
  @ApiProperty({
    description: '未完了の問い合わせ件数（OPEN / IN_PROGRESS）',
    example: 3,
  })
  openCount: number;

  /**
   * 施設側未返信件数。
   *
   * OPEN / IN_PROGRESS かつ、
   * 最新MESSAGEの送信者がCARE_MANAGERの問い合わせ。
   */
  @ApiProperty({
    description: '施設側が未返信の問い合わせ件数',
    example: 2,
  })
  unansweredCount: number;

  /**
   * 最近の問い合わせ。
   */
  @ApiProperty({
    description: '最近の問い合わせ一覧',
    type: [FacilityDashboardRecentInquiryDto],
  })
  recentInquiries: FacilityDashboardRecentInquiryDto[];
}

/**
 * 施設側ダッシュボードレスポンス。
 */
export class FacilityDashboardResponseDto {
  /**
   * 施設情報。
   *
   * 基本情報・空き状況・料金・受入条件を含む。
   */
  @ApiProperty({
    description: '施設ダッシュボード用施設情報',
    type: FacilityResponseDto,
  })
  facility: FacilityResponseDto;

  /**
   * 各情報が登録済みかどうか。
   *
   * フロント側で、
   * 「料金情報を入力してください」
   * などの表示に利用する。
   */
  @ApiProperty({
    description: '施設情報の登録状況',
    example: {
      availability: true,
      pricing: true,
      requirement: true,
    },
  })
  completion: {
    availability: boolean;

    pricing: boolean;

    requirement: boolean;
  };

  /**
   * 問い合わせサマリー。
   */
  @ApiProperty({
    description: '問い合わせ状況のサマリー',
    type: FacilityDashboardInquirySummaryDto,
  })
  inquirySummary: FacilityDashboardInquirySummaryDto;
}
