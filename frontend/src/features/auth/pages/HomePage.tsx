import { useEffect, useState } from "react";

import { getMe } from "../api/get-me";
import type { AuthMeResponse } from "../types/auth";

import { AdminDashboardPage } from "../../admin/pages/AdminDashboardPage";
import { CareManagerDashboardPage } from "../../care-managers/pages/CareManagerDashboardPage";
import { FacilityDashboardPage } from "../../facilities/pages/FacilityDashboardPage";

/**
 * ログイン後のホーム画面。
 *
 * ログインユーザー情報を取得し、
 * ユーザー権限に応じて表示画面を切り替える。
 *
 * ADMIN:
 * 管理者専用ダッシュボードを表示する。
 *
 * FACILITY:
 * 所属施設のダッシュボードを表示する。
 *
 * CARE_MANAGER:
 * ケアマネジャー向けダッシュボードを表示する。
 */
export function HomePage() {
  const [user, setUser] = useState<AuthMeResponse | null>(null);

  const [isLoading, setIsLoading] = useState(true);

  const [error, setError] = useState<string | null>(null);

  /**
   * ログイン中のユーザー情報を取得する。
   */
  useEffect(() => {
    let cancelled = false;

    getMe()
      .then((response) => {
        if (cancelled) {
          return;
        }

        setUser(response);
        setError(null);
      })
      .catch((error: unknown) => {
        if (cancelled) {
          return;
        }

        console.error("ログインユーザー情報の取得に失敗しました。", error);

        setError("ログインユーザー情報の取得に失敗しました。");
      })
      .finally(() => {
        if (cancelled) {
          return;
        }

        setIsLoading(false);
      });

    /**
     * コンポーネント破棄後に
     * state更新を行わないようにする。
     */
    return () => {
      cancelled = true;
    };
  }, []);

  /**
   * 読み込み中。
   */
  if (isLoading) {
    return (
      <div>
        <p>読み込み中...</p>
      </div>
    );
  }

  /**
   * ユーザー情報取得失敗。
   */
  if (error) {
    return (
      <div>
        <h1>Care Facility DX</h1>
        <p>{error}</p>
      </div>
    );
  }

  /**
   * ユーザー情報なし。
   */
  if (!user) {
    return (
      <div>
        <h1>Care Facility DX</h1>
        <p>ユーザー情報を取得できませんでした。</p>
      </div>
    );
  }

  /**
   * ADMINユーザー。
   *
   * 管理者専用ダッシュボードを表示する。
   */
  if (user.role === "ADMIN") {
    return <AdminDashboardPage />;
  }

  /**
   * FACILITYユーザー。
   *
   * 所属施設IDが取得できている場合は、
   * 自施設のダッシュボードを表示する。
   */
  if (user.role === "FACILITY" && user.facilityId) {
    return <FacilityDashboardPage facilityId={user.facilityId} />;
  }

  /**
   * CARE_MANAGERユーザー。
   *
   * ケアマネジャー向けダッシュボードを表示する。
   */
  if (user.role === "CARE_MANAGER") {
    return <CareManagerDashboardPage />;
  }

  /**
   * FACILITYユーザーだが、
   * facilityIdが取得できなかった場合。
   */
  if (user.role === "FACILITY" && !user.facilityId) {
    return (
      <div>
        <h1>Care Facility DX</h1>
        <p>所属施設情報を取得できませんでした。</p>
      </div>
    );
  }

  /**
   * 想定外のロールが返された場合。
   */
  return (
    <div>
      <h1>Care Facility DX</h1>
      <p>このアカウントに対応する画面がありません。</p>
    </div>
  );
}
