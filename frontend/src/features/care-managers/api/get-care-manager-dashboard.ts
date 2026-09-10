import { apiClient } from "../../../api/api-client";

import type { CareManagerDashboardResponse } from "../types/care-manager-dashboard";

/**
 * ケアマネジャーダッシュボード情報を取得する。
 *
 * @returns ケアマネジャーダッシュボード情報
 */
export async function getCareManagerDashboard(): Promise<CareManagerDashboardResponse> {
  const response = await apiClient.get<CareManagerDashboardResponse>(
    "/care-managers/dashboard",
  );

  return response.data;
}
