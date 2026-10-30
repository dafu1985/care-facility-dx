import { apiClient } from "../../../api/api-client";

import type {
  AdminFacility,
  AdminFacilityStatus,
} from "../types/admin-facility";

/**
 * ADMINによる施設の利用停止・再開。
 */
export async function updateAdminFacilityStatus(
  facilityId: string,
  status: AdminFacilityStatus,
): Promise<AdminFacility> {
  const response = await apiClient.patch<AdminFacility>(
    `/admin/facilities/${facilityId}/status`,
    { status },
  );

  return response.data;
}
