import { useEffect, useState } from "react";
import type { ReactNode } from "react";
import { Navigate } from "react-router-dom";

import { getMe } from "../../auth/api/get-me";
import type { AuthMeResponse } from "../../auth/types/auth";

interface RequireAdminProps {
  children: ReactNode;
}

/**
 * ADMIN権限を持つユーザーのみ表示する。
 *
 * ログインユーザー情報をAPIから取得し、
 * roleがADMINであることを確認する。
 */
export function RequireAdmin({ children }: RequireAdminProps) {
  const [user, setUser] = useState<AuthMeResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    let cancelled = false;

    getMe()
      .then((response) => {
        if (cancelled) return;
        setUser(response);
      })
      .catch(() => {
        if (cancelled) return;
        setHasError(true);
      })
      .finally(() => {
        if (cancelled) return;
        setIsLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  if (isLoading) {
    return <p>権限を確認しています...</p>;
  }

  if (hasError) {
    return <p>ユーザー権限を確認できませんでした。</p>;
  }

  if (user?.role !== "ADMIN") {
    return <Navigate to="/" replace />;
  }

  return children;
}
