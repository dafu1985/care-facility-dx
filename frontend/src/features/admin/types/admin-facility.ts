/**
 * 施設の利用ステータス。
 */
export type AdminFacilityStatus = "ACTIVE" | "INACTIVE";

/**
 * 施設種別。
 */
export interface AdminFacilityType {
  facilityTypeId: string;
  name: string;
}

/**
 * 空床状況。
 */
export interface AdminFacilityAvailability {
  status: string;
  availableCount: number | null;
  availableFrom: string | null;
  updatedAt: string;
}

/**
 * 料金情報。
 */
export interface AdminFacilityPricing {
  monthlyCostMin: number;
  monthlyCostMax: number;
  entranceFee: number;
  note: string | null;
}

/**
 * 受入条件・医療対応。
 */
export interface AdminFacilityRequirement {
  minCareLevel: number | null;
  maxCareLevel: number | null;
  dementiaAccepted: boolean;
  medicalCareAccepted: boolean;
  wheelchairAccepted: boolean;
  endOfLifeCare: boolean;
  note: string | null;
}

/**
 * ADMIN施設一覧・詳細の施設情報。
 */
export interface AdminFacility {
  facilityId: string;
  name: string;
  postalCode: string | null;
  address: string | null;
  area: string;
  phone: string | null;
  description: string | null;
  status: AdminFacilityStatus;
  facilityType: AdminFacilityType | null;

  availability: AdminFacilityAvailability | null;
  pricing: AdminFacilityPricing | null;
  requirement: AdminFacilityRequirement | null;
}

/**
 * ADMIN施設一覧APIのレスポンス。
 */
export interface AdminFacilityListResponse {
  items: AdminFacility[];
  page: number;
  pageSize: number;
  total: number;
}
