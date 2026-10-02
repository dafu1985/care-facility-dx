import { Alert, Badge, Button, Snackbar } from "@mui/material";
import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";

import { getInquiryUnreadSummary } from "../api/get-inquiry-unread-summary";
import type { InquiryUnreadSummary } from "../types/inquiry";

interface InquiryUnreadNotifierProps {
  children: React.ReactNode;
}

/**
 * ログイン中に問い合わせの未読状態を監視する。
 *
 * MVPではWebSocket/SSEを使用せず、
 * 30秒ごとに未読サマリーAPIを取得する。
 *
 * 未読メッセージが増えた場合は、
 * Snackbarで新着メッセージを通知する。
 */
export function InquiryUnreadNotifier({
  children,
}: InquiryUnreadNotifierProps) {
  const navigate = useNavigate();

  /**
   * 現在の未読メッセージサマリー。
   */
  const [unreadSummary, setUnreadSummary] =
    useState<InquiryUnreadSummary | null>(null);

  /**
   * 前回取得時の未読メッセージ件数。
   *
   * nullは「まだ初回取得が完了していない」ことを表す。
   * 初回取得時の既存未読ではSnackbarを表示しないために使用する。
   */
  const previousUnreadCountRef = useRef<number | null>(null);

  /**
   * 新着メッセージ通知Snackbarの表示状態。
   */
  const [isSnackbarOpen, setIsSnackbarOpen] = useState(false);

  /**
   * 未読メッセージサマリーを定期取得する。
   */
  useEffect(() => {
    let cancelled = false;

    /**
     * 未読サマリーを取得する。
     */
    const fetchUnreadSummary = async () => {
      try {
        const response = await getInquiryUnreadSummary();

        if (cancelled) {
          return;
        }

        const previousUnreadCount = previousUnreadCountRef.current;

        /**
         * 初回取得後に未読件数が増えていた場合だけ、
         * 新着メッセージとしてSnackbarを表示する。
         *
         * 例:
         * 初回 null → 7 : 通知しない
         * 7 → 7         : 通知しない
         * 7 → 8         : 通知する
         * 8 → 7         : 通知しない
         */
        if (
          previousUnreadCount !== null &&
          response.totalUnreadCount > previousUnreadCount
        ) {
          setIsSnackbarOpen(true);
        }

        /**
         * 今回の未読件数を次回比較用として保存する。
         */
        previousUnreadCountRef.current = response.totalUnreadCount;

        setUnreadSummary(response);
      } catch (error) {
        if (cancelled) {
          return;
        }

        console.error("問い合わせ未読サマリーの取得に失敗しました。", error);
      }
    };

    /**
     * 初回表示時にすぐ取得する。
     */
    void fetchUnreadSummary();

    /**
     * MVPでは30秒ごとに新着メッセージを確認する。
     */
    const intervalId = window.setInterval(() => {
      void fetchUnreadSummary();
    }, 30_000);

    return () => {
      cancelled = true;

      window.clearInterval(intervalId);
    };
  }, []);

  return (
    <>
      {children}

      {/* 未読メッセージが存在する場合のみ表示する */}
      {unreadSummary && unreadSummary.totalUnreadCount > 0 && (
        <Button
          variant="contained"
          onClick={() => {
            navigate("/inquiries");
          }}
          sx={{
            position: "fixed",
            top: 16,
            right: 16,
            zIndex: 1300,
          }}
        >
          <Badge
            badgeContent={unreadSummary.totalUnreadCount}
            color="error"
            sx={{
              mr: 1,
            }}
          >
            問い合わせ
          </Badge>
        </Button>
      )}

      {/* 新しい未読メッセージを検知した場合の通知 */}
      <Snackbar
        open={isSnackbarOpen}
        autoHideDuration={6000}
        onClose={() => {
          setIsSnackbarOpen(false);
        }}
        anchorOrigin={{
          vertical: "bottom",
          horizontal: "right",
        }}
      >
        <Alert
          severity="info"
          variant="filled"
          onClose={() => {
            setIsSnackbarOpen(false);
          }}
        >
          新しいメッセージが届きました。
        </Alert>
      </Snackbar>
    </>
  );
}
