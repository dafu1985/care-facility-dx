import { apiClient } from "../../../api/api-client";

import type { PlacementCase } from "../types/placement-case";

/**
 * 施設探し案件作成時のリクエスト。
 *
 * careManagerId / caseCode / status はBackend側で設定するため送信しない。
 */
export interface CreatePlacementCaseRequest {
  desiredMoveInDate?: string;
  urgency?: string;
  note?: string;
}

/**
 * 新しい施設探し案件を作成する。
 *
 * @param request 案件作成内容
 * @returns 作成された施設探し案件
 */
export async function createPlacementCase(
  request: CreatePlacementCaseRequest,
): Promise<PlacementCase> {
  const response = await apiClient.post<PlacementCase>(
    "/placement-cases",
    request,
  );

  return response.data;
}