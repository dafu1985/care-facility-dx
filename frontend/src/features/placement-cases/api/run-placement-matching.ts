import { apiClient } from "../../../api/api-client";

import type { CandidateFacility } from "../types/candidate-facility";

/**
 * 指定した施設探し案件に対してマッチングを実行する。
 *
 * @param placementCaseId 案件ID
 * @returns マッチング結果として生成された候補施設一覧
 */
export async function runPlacementMatching(
  placementCaseId: string,
): Promise<CandidateFacility[]> {
  const response = await apiClient.post<CandidateFacility[]>(
    `/placement-cases/${placementCaseId}/matching`,
  );

  return response.data;
}
