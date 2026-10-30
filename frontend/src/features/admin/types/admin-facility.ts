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
