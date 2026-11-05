import { apiClient } from "../../../api/api-client";

import type {
  FacilityMedicalCapability,
  ReplaceFacilityMedicalCapabilitiesRequest,
} from "../types/facility-medical-capability";

/**
 * 施設の医療対応情報を一括更新する。
 *
 * PUT /facilities/:facilityId/medical-capabilities
 *
 * 既存の登録情報を新しい内容で置き換える。
 */
export async function replaceFacilityMedicalCapabilities(
  facilityId: string,
  request: ReplaceFacilityMedicalCapabilitiesRequest,
): Promise<FacilityMedicalCapability[]> {
  const response = await apiClient.put<FacilityMedicalCapability[]>(
    `/facilities/${facilityId}/medical-capabilities`,
    request,
  );

  return response.data;
}
