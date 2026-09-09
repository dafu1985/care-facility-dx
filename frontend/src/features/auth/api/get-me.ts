import { apiClient } from "../../../api/api-client";

import type { AuthMeResponse } from "../types/auth";

/**
 * ログイン中のユーザー情報を取得する。
 *
 * JWTはapiClientのInterceptorによって
 * Authorizationヘッダーへ自動設定される。
 */
export async function getMe(): Promise<AuthMeResponse> {
  const response = await apiClient.get<AuthMeResponse>("/auth/me");

  return response.data;
}
