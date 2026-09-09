import { apiClient } from "../../../api/api-client";

/**
 * 問い合わせ作成リクエスト。
 *
 * BackendのCreateInquiryDtoに合わせる。
 */
export interface CreateInquiryRequest {
  facilityId: string;

  subject: string;

  body: string;
}

/**
 * 問い合わせ作成レスポンス。
 */
export interface CreateInquiryResponse {
  inquiryId: string;

  facilityId: string;

  createdByUserId: string;

  subject: string;

  status: string;

  lastMessageAt: string | null;

  createdAt: string;

  updatedAt: string;
}

/**
 * 問い合わせを新規作成する。
 *
 * Backend:
 * POST /api/v1/inquiries
 */
export async function createInquiry(
  request: CreateInquiryRequest,
): Promise<CreateInquiryResponse> {
  const response = await apiClient.post<CreateInquiryResponse>(
    "/inquiries",
    request,
  );

  return response.data;
}
