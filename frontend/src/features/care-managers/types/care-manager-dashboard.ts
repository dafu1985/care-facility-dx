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
  totalCount: number;
  openCount: number;
  answeredCount: number;
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
