import { apiClient } from "../../../api/api-client";

import type { AdminFacilityListResponse } from "../types/admin-facility";

/**
 * 管理者向け施設一覧を取得する。
 *
 * ACTIVE / INACTIVEの両方を取得する。
 * ADMIN権限が必要。
 */
export async function getAdminFacilities(): Promise<AdminFacilityListResponse> {
  const response =
    await apiClient.get<AdminFacilityListResponse>("/admin/facilities");

  return response.data;
}
