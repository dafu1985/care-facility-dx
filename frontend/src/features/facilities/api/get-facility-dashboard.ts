import { apiClient } from "../../../api/api-client";

import type { FacilityDashboardResponse } from "../types/facility";

/**
 * 施設ダッシュボード情報を取得する。
 *
 * @param facilityId 取得対象の施設ID
 * @returns 施設ダッシュボード情報
 */
export async function getFacilityDashboard(
  facilityId: string,
): Promise<FacilityDashboardResponse> {
  const response = await apiClient.get<FacilityDashboardResponse>(
    `/facilities/${facilityId}/dashboard`,
  );

  return response.data;
}
