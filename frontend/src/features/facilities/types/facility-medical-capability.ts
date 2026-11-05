/**
 * 施設の医療対応ステータス。
 */
export type FacilityMedicalCapabilityStatus =
  | "AVAILABLE"
  | "CONSULTATION"
  | "UNAVAILABLE";

/**
 * 医療条件マスタ。
 */
export interface FacilityMedicalCondition {
  medicalConditionId: string;
  code: string;
  name: string;
  displayOrder: number;
}

/**
 * 施設に登録されている医療対応情報。
 */
export interface FacilityMedicalCapability {
  facilityId: string;
  medicalConditionId: string;
  status: FacilityMedicalCapabilityStatus;
  note: string | null;
  medicalCondition: FacilityMedicalCondition;
}

/**
 * 医療対応情報の更新項目。
 */
export interface MedicalCapabilityInput {
  code: string;
  status: FacilityMedicalCapabilityStatus;
  note?: string | null;
}

/**
 * PUT /facilities/:facilityId/medical-capabilities
 * リクエスト。
 */
export interface ReplaceFacilityMedicalCapabilitiesRequest {
  capabilities: MedicalCapabilityInput[];
}
