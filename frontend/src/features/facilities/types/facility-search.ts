/**
 * 空き状況。
 */
export type AvailabilityStatus = "AVAILABLE" | "FEW" | "FULL" | "UNKNOWN";

/**
 * 施設種別。
 */
export interface FacilitySearchFacilityType {
  facilityTypeId: string;

  name: string;
}

/**
 * 空き状況。
 */
export interface FacilitySearchAvailability {
  status: AvailabilityStatus;

  availableCount: number | null;

  availableFrom: string | null;

  updatedAt: string;
}

/**
 * 料金情報。
 */
export interface FacilitySearchPricing {
  monthlyCostMin: number;

  monthlyCostMax: number;

  entranceFee: number;

  note: string | null;
}

/**
 * 受入条件。
 */
export interface FacilitySearchRequirement {
  minCareLevel: number | null;

  maxCareLevel: number | null;

  dementiaAccepted: boolean;

  medicalCareAccepted: boolean;

  wheelchairAccepted: boolean;

  endOfLifeCare: boolean;

  note: string | null;
}

/**
 * 施設検索結果1件分。
 */
export interface FacilitySearchItem {
  facilityId: string;

  name: string;

  postalCode: string | null;

  address: string | null;

  area: string;

  phone: string | null;

  description: string | null;

  status: string;

  facilityType: FacilitySearchFacilityType | null;

  availability: FacilitySearchAvailability | null;

  pricing: FacilitySearchPricing | null;

  requirement: FacilitySearchRequirement | null;
}

/**
 * 施設一覧レスポンス。
 */
export interface FacilitySearchResponse {
  items: FacilitySearchItem[];

  page: number;

  pageSize: number;

  total: number;
}

/**
 * GET /facilities の検索条件。
 *
 * BackendのFacilitySearchDtoに合わせる。
 */
export interface FacilitySearchParams {
  area?: string;

  facilityTypeId?: string;

  availability?: AvailabilityStatus;

  maxMonthlyCost?: number;

  careLevel?: number;

  dementiaAccepted?: boolean;

  medicalCareAccepted?: boolean;

  wheelchairAccepted?: boolean;

  endOfLifeCare?: boolean;

  page?: number;

  pageSize?: number;
}
