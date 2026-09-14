import { apiClient } from "../../../api/api-client";

import type { PlacementCase } from "../types/placement-case";

/**
 * ログイン中のケアマネジャー自身の案件一覧を取得する。
 *
 * @returns 施設探し案件一覧
 */
export async function getPlacementCases(): Promise<PlacementCase[]> {
  const response = await apiClient.get<PlacementCase[]>(
    "/placement-cases",
  );

  return response.data;
}
