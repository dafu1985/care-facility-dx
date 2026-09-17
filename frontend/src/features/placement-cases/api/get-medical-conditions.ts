import { apiClient } from "../../../api/api-client";

import type { MedicalCondition } from "../types/case-medical-requirement";

/**
 * 利用可能な医療条件マスタ一覧を取得する。
 *
 * Backend側で isActive = true の条件のみ、
 * displayOrder 順に返却される。
 */
export async function getMedicalConditions(): Promise<MedicalCondition[]> {
  const response = await apiClient.get<MedicalCondition[]>(
    "/medical-conditions",
  );

  return response.data;
}