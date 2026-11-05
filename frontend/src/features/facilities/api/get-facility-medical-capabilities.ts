import { apiClient } from "../../../api/api-client";

import type { FacilityMedicalCapability } from "../types/facility-medical-capability";

/**
 * 施設に登録されている医療対応情報を取得する。
 *
 * GET /facilities/:facilityId/medical-capabilities
 */
export async function getFacilityMedicalCapabilities(
  facilityId: string,
): Promise<FacilityMedicalCapability[]> {
  const response = await apiClient.get<FacilityMedicalCapability[]>(
    `/facilities/${facilityId}/medical-capabilities`,
  );

  return response.data;
}
