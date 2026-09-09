import axios from "axios";

import { getAccessToken } from "../features/auth/utils/token-storage";

/**
 * バックエンドAPI共通クライアント。
 */
export const apiClient = axios.create({
  baseURL: "http://localhost:3000/api/v1",

  headers: {
    "Content-Type": "application/json",
  },
});

/**
 * APIリクエスト時にJWTをAuthorizationヘッダーへ設定する。
 */
apiClient.interceptors.request.use((config) => {
  const accessToken = getAccessToken();

  /**
   * 認証問題の確認用。
   * JWTそのものはログへ出さない。
   */
  console.log("accessToken exists:", Boolean(accessToken));

  if (accessToken) {
    config.headers.Authorization = `Bearer ${accessToken}`;
  }

  console.log("Authorization exists:", Boolean(config.headers.Authorization));

  return config;
});
