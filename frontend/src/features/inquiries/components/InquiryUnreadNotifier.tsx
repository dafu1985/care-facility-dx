import { Alert, Snackbar } from "@mui/material";
import { useEffect, useRef, useState } from "react";

import { getInquiryUnreadSummary } from "../api/get-inquiry-unread-summary";
import type { InquiryUnreadSummary } from "../types/inquiry";

interface InquiryUnreadNotifierProps {
  children: (unreadCount: number) => React.ReactNode;
}

/**
 * ログイン中に問い合わせの未読状態を監視する。
 *
 * MVPではWebSocket/SSEを使用せず、
 * 30秒ごとに未読サマリーAPIを取得する。
 *
 * 未読件数はchildrenへ渡し、
 * 実際の未読表示はHeaderなどのUI側で行う。
 *
 * 新しい未読メッセージを検知した場合は
 * Snackbarでユーザーへ通知する。
 */
export function InquiryUnreadNotifier({
  children,
}: InquiryUnreadNotifierProps) {
  /**
   * 現在の未読メッセージサマリー。
   */
  const [unreadSummary, setUnreadSummary] =
    useState<InquiryUnreadSummary | null>(null);

  /**
   * 前回取得時の未読メッセージ件数。
   *
   * nullは初回取得前を表す。
   * 初回取得時に既存未読が存在してもSnackbarは表示しない。
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
         * 初回取得後に未読件数が増えた場合のみ、
         * 新着メッセージとしてSnackbarを表示する。
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
     * 初回表示時に取得する。
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

  /**
   * API取得前は0件として扱う。
   */
  const unreadCount = unreadSummary?.totalUnreadCount ?? 0;

  return (
    <>
      {/* 未読件数をレイアウト側へ渡す */}
      {children(unreadCount)}

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
