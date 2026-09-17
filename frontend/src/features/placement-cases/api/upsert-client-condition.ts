import { apiClient } from "../../../api/api-client";

import type { ClientCondition } from "../types/client-condition";

/**
 * 利用者条件の登録・更新リクエスト。
 *
 * Backend UpsertClientConditionDto に対応する。
 */
export interface UpsertClientConditionRequest {
  ageGroup?: string;
  gender?: string;
  careLevel?: string;
  budgetMax?: number;
  desiredArea?: string;
  publicAssistance?: boolean;
  guarantorAvailable?: boolean;
  dementia?: boolean;
  endOfLifeCare?: boolean;
  desiredMoveInDate?: string;
}

/**
 * 指定した施設探し案件の利用者条件を登録・更新する。
 *
 * Backend側がUpsertとして実装されているため、
 * 初回登録・既存条件の更新のどちらでも同じAPIを使用する。
 *
 * @param placementCaseId 案件ID
 * @param request 利用者条件
 * @returns 登録・更新後の利用者条件
 */
export async function upsertClientCondition(
  placementCaseId: string,
  request: UpsertClientConditionRequest,
): Promise<ClientCondition> {
  const response = await apiClient.put<ClientCondition>(
    `/placement-cases/${placementCaseId}/conditions`,
    request,
  );

  return response.data;
}