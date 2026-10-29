import type { InquiryStatus } from "../types/inquiry";

/**
 * 問い合わせステータスの表示名を取得する。
 */
export function getStatusLabel(status: InquiryStatus): string {
  switch (status) {
    case "OPEN":
      return "未対応";

    case "IN_PROGRESS":
      return "対応中";

    case "ANSWERED":
      return "回答済み";

    case "CLOSED":
      return "完了";

    case "CANCELLED":
      return "キャンセル";

    default:
      return status;
  }
}
