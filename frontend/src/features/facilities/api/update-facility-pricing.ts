import { apiClient } from "../../../api/api-client";

import type { FacilityPricing } from "../types/facility";

/**
 * 料金情報更新リクエスト。
 *
 * PATCHなので全項目Optional。
 */
export interface UpdateFacilityPricingRequest {
  monthlyCostMin?: number;
  monthlyCostMax?: number;
  entranceFee?: number;
  note?: string | null;
}

/**
 * 施設の料金情報を更新する。
 */
export async function updateFacilityPricing(
  facilityId: string,
  request: UpdateFacilityPricingRequest,
): Promise<FacilityPricing> {
  const response = await apiClient.patch<FacilityPricing>(
    `/facilities/${facilityId}/pricing`,
    request,
  );

  return response.data;
}
