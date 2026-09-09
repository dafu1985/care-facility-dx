import { useEffect, useState } from "react";

import { getMe } from "../api/get-me";
import type { AuthMeResponse } from "../types/auth";

import { FacilityDashboardPage } from "../../facilities/pages/FacilityDashboardPage";

/**
 * ログイン後のホーム画面。
 *
 * ログインユーザー情報を取得し、
 * FACILITYユーザーの場合は
 * 所属施設のダッシュボードを表示する。
 */
export function HomePage() {
  const [user, setUser] = useState<AuthMeResponse | null>(null);

  const [isLoading, setIsLoading] = useState(true);

  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    /**
     * ログイン中のユーザー情報を取得する。
     */
    async function fetchMe() {
      try {
        setIsLoading(true);
        setError(null);

        const response = await getMe();

        setUser(response);
      } catch (error) {
        console.error("ログインユーザー情報の取得に失敗しました。", error);

        setError("ログインユーザー情報の取得に失敗しました。");
      } finally {
        setIsLoading(false);
      }
    }

    void fetchMe();
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
   * FACILITYユーザーで
   * 所属施設IDが取得できている場合は、
   * 施設ダッシュボードを表示する。
   */
  if (user.role === "FACILITY" && user.facilityId) {
    return <FacilityDashboardPage facilityId={user.facilityId} />;
  }

  /**
   * FACILITY以外は一旦ユーザー情報を表示する。
   *
   * 後ほどCARE_MANAGER / ADMIN用画面へ分岐する。
   */
  return (
    <div>
      <h1>Care Facility DX</h1>

      <h2>ログインユーザー</h2>

      <dl>
        <dt>メールアドレス</dt>
        <dd>{user.email}</dd>

        <dt>権限</dt>
        <dd>{user.role}</dd>

        <dt>施設ID</dt>
        <dd>{user.facilityId ?? "所属施設なし"}</dd>
      </dl>
    </div>
  );
}
