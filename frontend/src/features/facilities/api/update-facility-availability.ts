import { apiClient } from "../../../api/api-client";

import type { FacilityAvailability } from "../types/facility";

/**
 * 空き状況更新リクエスト。
 *
 * PATCHなので全項目Optionalとする。
 */
export interface UpdateFacilityAvailabilityRequest {
  status?: string;
  availableCount?: number | null;
  availableFrom?: string | null;
  note?: string | null;
}

/**
 * 施設の空き状況を更新する。
 */
export async function updateFacilityAvailability(
  facilityId: string,
  request: UpdateFacilityAvailabilityRequest,
): Promise<FacilityAvailability> {
  const response = await apiClient.patch<FacilityAvailability>(
    `/facilities/${facilityId}/availability`,
    request,
  );

  return response.data;
}
