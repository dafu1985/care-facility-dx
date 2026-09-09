import { apiClient } from "../../../api/api-client";

import type { InquiryMessage } from "../types/inquiry";

/**
 * 問い合わせメッセージ追加リクエスト。
 */
export interface AddInquiryMessageRequest {
  body: string;
}

/**
 * 問い合わせにメッセージを追加する。
 */
export async function addInquiryMessage(
  inquiryId: string,
  request: AddInquiryMessageRequest,
): Promise<InquiryMessage> {
  const response = await apiClient.post<InquiryMessage>(
    `/inquiries/${inquiryId}/messages`,
    request,
  );

  return response.data;
}
