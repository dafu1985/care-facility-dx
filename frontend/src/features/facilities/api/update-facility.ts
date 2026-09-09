import { apiClient } from "../../../api/api-client";

import type { Facility } from "../types/facility";

/**
 * 施設基本情報更新リクエスト。
 *
 * PATCHなので全項目Optional。
 */
export interface UpdateFacilityRequest {
  name?: string;
  postalCode?: string | null;
  address?: string | null;
  area?: string;
  phone?: string | null;
  description?: string | null;
}

/**
 * 施設基本情報を更新する。
 */
export async function updateFacility(
  facilityId: string,
  request: UpdateFacilityRequest,
): Promise<Facility> {
  const response = await apiClient.patch<Facility>(
    `/facilities/${facilityId}`,
    request,
  );

  return response.data;
}
