import type { ReactNode } from "react";
import { Navigate } from "react-router-dom";

import { getAccessToken } from "../utils/token-storage";

interface RequireAuthProps {
  children: ReactNode;
}

/**
 * 認証済みユーザーのみ子要素を表示する。
 *
 * JWTが存在しない場合はログイン画面へ遷移する。
 *
 * 未読通知などのアプリ共通機能は
 * AuthenticatedLayout側で管理する。
 */
export function RequireAuth({ children }: RequireAuthProps) {
  const accessToken = getAccessToken();

  if (!accessToken) {
    return <Navigate to="/login" replace />;
  }

  return children;
}
