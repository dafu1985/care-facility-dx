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
   * 全問い合わせ件数。
   */
  totalCount: number;

  /**
   * 未対応件数。
   */
  openCount: number;

  /**
   * 対応中件数。
   */
  inProgressCount: number;

  /**
   * 回答済み件数。
   */
  answeredCount: number;

  /**
   * 最近の問い合わせ。
   */
  recentInquiries: CareManagerDashboardInquiry[];
}

export interface CareManagerDashboardCareManager {
  userId: string;
  organizationName: string;
  licenseNumber: string | null;
}

export interface CareManagerDashboardResponse {
  careManager: CareManagerDashboardCareManager;
  inquirySummary: CareManagerDashboardInquirySummary;
}
