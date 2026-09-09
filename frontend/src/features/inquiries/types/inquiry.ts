/**
 * 問い合わせステータス。
 */
export type InquiryStatus =
  | "OPEN"
  | "IN_PROGRESS"
  | "ANSWERED"
  | "CLOSED"
  | "CANCELLED";

/**
 * 問い合わせメッセージ種別。
 */
export type InquiryMessageType = "MESSAGE" | "STATUS_CHANGE" | "SYSTEM";

/**
 * 問い合わせメッセージ。
 */
export interface InquiryMessage {
  messageId: string;

  /**
   * SYSTEMメッセージの場合はnull。
   */
  senderUserId: string | null;

  type: InquiryMessageType;

  body: string;

  /**
   * BackendではDateだが、
   * JSONレスポンスではISO文字列になる。
   */
  createdAt: string;
}

/**
 * 問い合わせ詳細。
 *
 * GET /inquiries/{inquiryId}
 */
export interface Inquiry {
  inquiryId: string;

  facilityId: string;

  createdByUserId: string;

  subject: string;

  status: InquiryStatus;

  lastMessageAt: string | null;

  createdAt: string;

  updatedAt: string;

  messages: InquiryMessage[];
}

/**
 * 問い合わせ一覧1件分。
 */
export interface InquiryListItem {
  inquiryId: string;

  facilityId: string;

  /**
   * 問い合わせ先施設名。
   *
   * BackendのInquiryListItemResponseDtoに対応する。
   */
  facilityName: string;

  createdByUserId: string;

  subject: string;

  status: InquiryStatus;

  lastMessageAt: string | null;

  createdAt: string;

  updatedAt: string;
}

/**
 * 問い合わせ一覧レスポンス。
 *
 * GET /inquiries
 */
export interface InquiryListResponse {
  items: InquiryListItem[];

  page: number;

  pageSize: number;

  total: number;
}
