import { apiClient } from "../../../api/api-client";

import type { CaseMedicalRequirement } from "../types/case-medical-requirement";

/**
 * 指定した施設探し案件の医療条件一覧を取得する。
 *
 * @param placementCaseId 案件ID
 * @returns 医療条件一覧
 */
export async function getCaseMedicalRequirements(
  placementCaseId: string,
): Promise<CaseMedicalRequirement[]> {
  const response = await apiClient.get<CaseMedicalRequirement[]>(
    `/placement-cases/${placementCaseId}/medical-requirements`,
  );

  return response.data;
}
