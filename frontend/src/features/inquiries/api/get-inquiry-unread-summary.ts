import { apiClient } from "../../../api/api-client";

import type { InquiryUnreadSummary } from "../types/inquiry";

/**
 * ログインユーザーの未読メッセージサマリーを取得する。
 *
 * 未読対象はBackend側で以下に限定される。
 * - MESSAGEのみ
 * - 自分以外が送信したメッセージのみ
 *
 * @returns 未読メッセージサマリー
 */
export async function getInquiryUnreadSummary(): Promise<InquiryUnreadSummary> {
  const response = await apiClient.get<InquiryUnreadSummary>(
    "/inquiries/unread-summary",
  );

  return response.data;
}
