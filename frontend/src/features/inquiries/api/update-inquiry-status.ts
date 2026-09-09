import { apiClient } from "../../../api/api-client";

import type { Inquiry, InquiryStatus } from "../types/inquiry";

/**
 * 問い合わせステータス更新リクエスト。
 */
export interface UpdateInquiryStatusRequest {
  status: InquiryStatus;
}

/**
 * 問い合わせステータスを更新する。
 */
export async function updateInquiryStatus(
  inquiryId: string,
  request: UpdateInquiryStatusRequest,
): Promise<Inquiry> {
  const response = await apiClient.patch<Inquiry>(
    `/inquiries/${inquiryId}/status`,
    request,
  );

  return response.data;
}
