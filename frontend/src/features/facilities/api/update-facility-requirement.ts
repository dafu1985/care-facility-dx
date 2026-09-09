import { apiClient } from "../../../api/api-client";

import type { FacilityRequirement } from "../types/facility";

/**
 * 受入条件更新リクエスト。
 *
 * PATCHなので全項目Optional。
 */
export interface UpdateFacilityRequirementRequest {
  minCareLevel?: number;
  maxCareLevel?: number;
  dementiaAccepted?: boolean;
  medicalCareAccepted?: boolean;
  wheelchairAccepted?: boolean;
  endOfLifeCare?: boolean;
  note?: string | null;
}

/**
 * 施設の受入条件を更新する。
 */
export async function updateFacilityRequirement(
  facilityId: string,
  request: UpdateFacilityRequirementRequest,
): Promise<FacilityRequirement> {
  const response = await apiClient.patch<FacilityRequirement>(
    `/facilities/${facilityId}/requirement`,
    request,
  );

  return response.data;
}
