import { apiClient } from "../../../api/api-client";

import type { AdminDashboardResponse } from "../types/admin-dashboard";

/**
 * 管理者ダッシュボードの集計情報を取得する。
 *
 * ADMIN権限が必要。
 */
export async function getAdminDashboard(): Promise<AdminDashboardResponse> {
  const response =
    await apiClient.get<AdminDashboardResponse>("/admin/dashboard");

  return response.data;
}
