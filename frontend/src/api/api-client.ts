import axios from "axios";

import { getAccessToken } from "../features/auth/utils/token-storage";

/**
 * Backend APIのBase URL。
 *
 * ローカル:
 * http://localhost:3000/api/v1
 *
 * Vercel:
 * VITE_API_BASE_URLで指定する。
 */
const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL ?? "http://localhost:3000/api/v1";

/**
 * Backend API共通Client。
 */
export const apiClient = axios.create({
  baseURL: API_BASE_URL,

  headers: {
    "Content-Type": "application/json",
  },
});

/**
 * APIリクエスト時に保存済みJWTが存在する場合、
 * Authorizationヘッダーへ自動設定する。
 */
apiClient.interceptors.request.use((config) => {
  const accessToken = getAccessToken();

  if (accessToken) {
    config.headers.Authorization = `Bearer ${accessToken}`;
  }

  return config;
});
