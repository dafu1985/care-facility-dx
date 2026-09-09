import { apiClient } from "../../../api/api-client";

import type { LoginRequest, LoginResponse } from "../types/auth";

/**
 * ログインする。
 */
export async function login(request: LoginRequest): Promise<LoginResponse> {
  const response = await apiClient.post<LoginResponse>("/auth/login", request);

  return response.data;
}
