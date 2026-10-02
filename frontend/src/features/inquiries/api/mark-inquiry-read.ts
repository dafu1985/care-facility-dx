import { apiClient } from "../../../api/api-client";

/**
 * 問い合わせを指定メッセージまで既読にする。
 *
 * 画面に実際に表示した最後のmessageIdをBackendへ送ることで、
 * 詳細取得後に新しいメッセージが届いた場合でも、
 * そのメッセージまで誤って既読になることを防ぐ。
 *
 * @param inquiryId 問い合わせID
 * @param messageId 画面に表示した最後のメッセージID
 */
export async function markInquiryRead(
  inquiryId: string,
  messageId: string,
): Promise<void> {
  await apiClient.put(`/inquiries/${inquiryId}/read`, {
    messageId,
  });
}
