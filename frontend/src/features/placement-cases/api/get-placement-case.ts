import { apiClient } from "../../../api/api-client";

import type { PlacementCase } from "../types/placement-case";

/**
 * 指定した施設探し案件の詳細を取得する。
 *
 * @param placementCaseId 案件ID
 * @returns 施設探し案件詳細
 */
export async function getPlacementCase(
  placementCaseId: string,
): Promise<PlacementCase> {
  const response = await apiClient.get<PlacementCase>(
    `/placement-cases/${placementCaseId}`,
  );

  return response.data;
}
