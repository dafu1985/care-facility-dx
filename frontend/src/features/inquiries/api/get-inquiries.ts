import { apiClient } from "../../../api/api-client";

import type { InquiryListResponse, InquiryStatus } from "../types/inquiry";

/**
 * 問い合わせ一覧検索条件。
 *
 * BackendのInquirySearchDtoに合わせて
 * 必要に応じて今後項目を追加する。
 */
export interface GetInquiriesParams {
  page?: number;

  pageSize?: number;

  status?: InquiryStatus;

  facilityId?: string;
}

/**
 * 問い合わせ一覧を取得する。
 *
 * FACILITYユーザーの場合は、
 * Backend側で自施設の問い合わせだけに制限される。
 */
export async function getInquiries(
  params: GetInquiriesParams = {},
): Promise<InquiryListResponse> {
  const response = await apiClient.get<InquiryListResponse>("/inquiries", {
    params,
  });

  return response.data;
}
