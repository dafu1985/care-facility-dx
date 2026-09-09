import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import { getMe } from "../api/get-me";
import type { AuthMeResponse } from "../types/auth";

import { FacilityDashboardPage } from "../../facilities/pages/FacilityDashboardPage";
import { Button } from "@mui/material";

import { removeAccessToken } from "../utils/token-storage";

/**
 * ログイン後のホーム画面。
 *
 * ログインユーザー情報を取得し、
 * ユーザー権限に応じて表示画面を切り替える。
 *
 * FACILITY:
 * 所属施設のダッシュボードを表示する。
 *
 * CARE_MANAGER:
 * ケアマネジャー向けメニューを表示する。
 *
 * ADMIN:
 * 現時点ではログインユーザー情報を表示する。
 */
export function HomePage() {
  /**
   * React Routerによる画面遷移用。
   */
  const navigate = useNavigate();

  const [user, setUser] = useState<AuthMeResponse | null>(null);

  const [isLoading, setIsLoading] = useState(true);

  const [error, setError] = useState<string | null>(null);

  /**
   * ログアウト処理。
   */
  const handleLogout = () => {
    removeAccessToken();

    navigate("/login", {
      replace: true,
    });
  };

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
      .catch((error) => {
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
   * 施設検索・問い合わせ一覧へ
   * 遷移できるメニューを表示する。
   */
  if (user.role === "CARE_MANAGER") {
    return (
      <div
        style={{
          maxWidth: 800,
          margin: "0 auto",
          padding: 32,
        }}
      >
        <h1>Care Facility DX</h1>

        <h2>ケアマネジャーメニュー</h2>

        <p>施設検索や問い合わせ確認を行えます。</p>

        <Button variant="outlined" onClick={handleLogout}>
          ログアウト
        </Button>

        <div
          style={{
            display: "flex",
            gap: 16,
            marginTop: 24,
            flexWrap: "wrap",
          }}
        >
          <button
            type="button"
            onClick={() => {
              navigate("/facilities");
            }}
          >
            施設を検索する
          </button>

          <button
            type="button"
            onClick={() => {
              navigate("/inquiries");
            }}
          >
            自分の問い合わせを見る
          </button>
        </div>
      </div>
    );
  }

  /**
   * FACILITYに所属しているはずだが
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
   * 現時点ではADMINなど、
   * 専用画面が未実装のユーザー情報を表示する。
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
