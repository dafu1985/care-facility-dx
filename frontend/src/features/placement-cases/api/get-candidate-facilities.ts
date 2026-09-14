import { apiClient } from "../../../api/api-client";

import type { CandidateFacility } from "../types/candidate-facility";

/**
 * 指定した施設探し案件に保存されている候補施設一覧を取得する。
 *
 * @param placementCaseId 案件ID
 * @returns 候補施設一覧
 */
export async function getCandidateFacilities(
  placementCaseId: string,
): Promise<CandidateFacility[]> {
  const response = await apiClient.get<CandidateFacility[]>(
    `/placement-cases/${placementCaseId}/candidates`,
  );

  return response.data;
}
