import { apiClient } from "../../../api/api-client";

import type {
  FacilitySearchParams,
  FacilitySearchResponse,
} from "../types/facility-search";

/**
 * 介護施設を検索する。
 *
 * Backend:
 * GET /api/v1/facilities
 */
export async function searchFacilities(
  params: FacilitySearchParams,
): Promise<FacilitySearchResponse> {
  const response = await apiClient.get<FacilitySearchResponse>("/facilities", {
    params,
  });

  return response.data;
}
