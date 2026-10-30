import { apiClient } from "../../../api/api-client";

import type { AdminFacility } from "../types/admin-facility";

/**
 * 管理者向け施設詳細を取得する。
 *
 * ACTIVE / INACTIVEの両方を取得できる。
 */
export async function getAdminFacility(
  facilityId: string,
): Promise<AdminFacility> {
  const response = await apiClient.get<AdminFacility>(
    `/admin/facilities/${facilityId}`,
  );

  return response.data;
}
