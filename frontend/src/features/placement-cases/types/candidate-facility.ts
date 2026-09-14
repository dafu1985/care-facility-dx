/**
 * 候補施設のステータス。
 */
export type CandidateFacilityStatus =
  | "CONSIDERING"
  | "INQUIRING"
  | "AVAILABLE"
  | "VISIT_SCHEDULED"
  | "APPLIED"
  | "ACCEPTED"
  | "REJECTED"
  | "DECLINED";

/**
 * 候補施設に紐づく施設情報。
 */
export interface CandidateFacilityDetail {
  facilityId: string;
  facilityTypeId: string;
  name: string;
  postalCode: string | null;
  address: string | null;
  area: string | null;
  phone: string | null;
  description: string | null;
  status: string;
  createdAt: string;
  updatedAt: string;
}

/**
 * マッチングによって作成された候補施設。
 */
export interface CandidateFacility {
  candidateFacilityId: string;
  placementCaseId: string;
  facilityId: string;
  matchScore: number | null;
  status: CandidateFacilityStatus;
  note: string | null;
  createdAt: string;
  updatedAt: string;
  facility?: CandidateFacilityDetail;
}
