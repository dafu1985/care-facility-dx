export interface CareManagerDashboardInquiry {
  inquiryId: string;
  subject: string;
  status: string;
  facilityId: string;
  facilityName: string;
  lastMessageAt: string | null;
  createdAt: string;
}

export interface CareManagerDashboardInquirySummary {
  /**
   * 全問い合わせ件数
   */
  totalCount: number;

  /**
   * 対応中・未完了の問い合わせ件数
   */
  openCount: number;

  /**
   * 回答済み問い合わせ件数
   */
  answeredCount: number;

  /**
   * 最近の問い合わせ
   */
  recentInquiries: CareManagerDashboardInquiry[];
}

export interface CareManagerDashboardResponse {
  /**
   * ログイン中のケアマネ情報
   */
  careManager: {
    userId: string;
    organizationName: string;
    licenseNumber: string | null;
  };

  /**
   * 問い合わせサマリー
   */
  inquirySummary: CareManagerDashboardInquirySummary;
}
