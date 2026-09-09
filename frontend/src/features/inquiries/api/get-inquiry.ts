import { apiClient } from "../../../api/api-client";

import type { Inquiry } from "../types/inquiry";

/**
 * 問い合わせ詳細を取得する。
 *
 * @param inquiryId 問い合わせID
 */
export async function getInquiry(inquiryId: string): Promise<Inquiry> {
  const response = await apiClient.get<Inquiry>(`/inquiries/${inquiryId}`);

  return response.data;
}
