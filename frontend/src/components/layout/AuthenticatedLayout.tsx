import { useEffect } from "react";
import { Box } from "@mui/material";
import { Outlet, useLocation } from "react-router-dom";

import { InquiryUnreadNotifier } from "../../features/inquiries/components/InquiryUnreadNotifier";
import { AppHeader } from "./AppHeader";
import { AppNavigation } from "./AppNavigation";

/**
 * ログイン後の画面で共通利用するアプリケーションレイアウト。
 *
 * Header・Navigation・未読通知を共通化し、
 * Outlet部分に各機能のページを表示する。
 */
export function AuthenticatedLayout() {
  const { pathname } = useLocation();

  /**
   * 画面遷移時にスクロール位置を先頭へ戻す。
   * 同じパス内での状態変更では実行しない。
   */
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return (
    <InquiryUnreadNotifier>
      {(unreadCount) => (
        <Box
          sx={{
            minHeight: "100vh",
            bgcolor: "background.default",
          }}
        >
          {/* 共通ヘッダー */}
          <AppHeader unreadCount={unreadCount} />

          {/* 共通ナビゲーション */}
          <AppNavigation />

          {/* 各ページ */}
          <Box
            component="main"
            sx={{
              pb: 6,
            }}
          >
            <Outlet />
          </Box>
        </Box>
      )}
    </InquiryUnreadNotifier>
  );
}
