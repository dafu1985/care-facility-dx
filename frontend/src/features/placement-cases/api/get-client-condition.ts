import axios from "axios";

import { apiClient } from "../../../api/api-client";

import type { ClientCondition } from "../types/client-condition";

/**
 * 指定した施設探し案件の利用者条件を取得する。
 *
 * 利用者条件がまだ登録されていない場合、Backendは404を返す。
 * その場合はエラーではなく「未登録」としてnullを返す。
 *
 * @param placementCaseId 案件ID
 * @returns 利用者条件。未登録の場合はnull
 */
export async function getClientCondition(
  placementCaseId: string,
): Promise<ClientCondition | null> {
  try {
    const response = await apiClient.get<ClientCondition>(
      `/placement-cases/${placementCaseId}/conditions`,
    );

    return response.data;
  } catch (error) {
    if (
      axios.isAxiosError(error) &&
      error.response?.status === 404
    ) {
      return null;
    }

    throw error;
  }
}