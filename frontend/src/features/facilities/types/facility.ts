/**
 * 施設種別。
 */
export interface FacilityType {
  facilityTypeId: string;
  name: string;
}

/**
 * 施設の空き状況。
 */
export interface FacilityAvailability {
  status: string;

  availableCount: number | null;

  availableFrom: string | null;

  note: string | null;

  updatedAt: string;
}

/**
 * 施設の料金情報。
 */
export interface FacilityPricing {
  monthlyCostMin: number | null;
  monthlyCostMax: number | null;
  entranceFee: number | null;
  note: string | null;
}

/**
 * 施設の受入条件。
 */
export interface FacilityRequirement {
  minCareLevel: number | null;
  maxCareLevel: number | null;
  dementiaAccepted: boolean;
  medicalCareAccepted: boolean;
  wheelchairAccepted: boolean;
  endOfLifeCare: boolean;
  note: string | null;
}

/**
 * 施設基本情報。
 */
export interface Facility {
  facilityId: string;
  name: string;
  postalCode: string;
  address: string;
  area: string;
  phone: string | null;
  description: string | null;
  status: string;

  facilityType: FacilityType;

  availability: FacilityAvailability | null;
  pricing: FacilityPricing | null;
  requirement: FacilityRequirement | null;
}

/**
 * 施設情報の登録状況。
 */
export interface FacilityCompletion {
  availability: boolean;
  pricing: boolean;
  requirement: boolean;
}

/**
 * 最近の問い合わせ。
 */
export interface RecentInquiry {
  inquiryId: string;
  subject: string;
  status: string;
  lastMessageAt: string | null;
}

/**
 * 問い合わせサマリー。
 */
export interface InquirySummary {
  openCount: number;
  unansweredCount: number;
  recentInquiries: RecentInquiry[];
}

/**
 * 施設ダッシュボードAPIレスポンス。
 *
 * GET /facilities/{facilityId}/dashboard
 */
export interface FacilityDashboardResponse {
  facility: Facility;

  completion: FacilityCompletion;

  inquirySummary: InquirySummary;
}
