import { apiClient } from "../../../api/api-client";

/**
 * 問い合わせ作成リクエスト。
 *
 * 通常の施設問い合わせでは facilityId のみを指定する。
 * 施設探し案件の候補施設から問い合わせる場合は、
 * placementCaseId と candidateFacilityId も指定する。
 */
export interface CreateInquiryRequest {
  facilityId: string;

  placementCaseId?: string;

  candidateFacilityId?: string;

  subject: string;

  body: string;
}

/**
 * 問い合わせ作成レスポンス。
 */
export interface CreateInquiryResponse {
  inquiryId: string;

  facilityId: string;

  placementCaseId: string | null;

  candidateFacilityId: string | null;

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
