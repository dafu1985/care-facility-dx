import { apiClient } from "../../../api/api-client";

import type { ClientCondition } from "../types/client-condition";

/**
 * 指定した施設探し案件の利用者条件を取得する。
 *
 * @param placementCaseId 案件ID
 * @returns 利用者条件
 */
export async function getClientCondition(
  placementCaseId: string,
): Promise<ClientCondition> {
  const response = await apiClient.get<ClientCondition>(
    `/placement-cases/${placementCaseId}/conditions`,
  );

  return response.data;
}
