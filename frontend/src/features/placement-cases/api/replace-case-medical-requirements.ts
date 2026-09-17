import { apiClient } from "../../../api/api-client";

import type {
  CaseMedicalRequirement,
  MedicalRequirementLevel,
} from "../types/case-medical-requirement";

/**
 * 医療条件1件分の保存データ。
 */
export interface MedicalRequirementRequest {
  code: string;
  requirementLevel: MedicalRequirementLevel;
  note?: string;
}

/**
 * 案件に紐づく医療条件を全置換する。
 *
 * Backendの ReplaceMedicalRequirementsDto に対応する。
 */
export async function replaceCaseMedicalRequirements(
  placementCaseId: string,
  requirements: MedicalRequirementRequest[],
): Promise<CaseMedicalRequirement[]> {
  const response = await apiClient.put<CaseMedicalRequirement[]>(
    `/placement-cases/${placementCaseId}/medical-requirements`,
    {
      requirements,
    },
  );

  return response.data;
}