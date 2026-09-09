import type { ReactNode } from "react";
import { Navigate } from "react-router-dom";

import { getAccessToken } from "../utils/token-storage";

interface RequireAuthProps {
  children: ReactNode;
}

/**
 * 認証済みユーザーのみ表示するためのラッパー。
 *
 * JWTが存在しない場合は、
 * ログイン画面へ遷移する。
 */
export function RequireAuth({ children }: RequireAuthProps) {
  const accessToken = getAccessToken();

  /**
   * JWTが存在しない場合は
   * ログイン画面へリダイレクトする。
   */
  if (!accessToken) {
    return <Navigate to="/login" replace />;
  }

  return children;
}
