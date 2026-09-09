import { apiClient } from "../../../api/api-client";

import type { FacilitySearchItem } from "../types/facility-search";

/**
 * 施設詳細を取得する。
 *
 * Backend:
 * GET /api/v1/facilities/:facilityId
 */
export async function getFacility(
  facilityId: string,
): Promise<FacilitySearchItem> {
  const response = await apiClient.get<FacilitySearchItem>(
    `/facilities/${facilityId}`,
  );

  return response.data;
}
