import axios from "axios";

/**
 * 問い合わせステータス更新時のエラーを日本語メッセージに変換する。
 */
export function getInquiryStatusUpdateErrorMessage(error: unknown): string {
  const defaultMessage = "ステータス更新に失敗しました。";

  if (!axios.isAxiosError(error)) {
    return defaultMessage;
  }

  const statusCode = error.response?.status;
  const message: unknown = error.response?.data?.message;

  if (statusCode === 403) {
    if (message === "You do not have permission to access this inquiry") {
      return "この問い合わせにアクセスする権限がありません。";
    }

    if (
      typeof message === "string" &&
      message.includes("status transition is not allowed")
    ) {
      return "現在のステータスから選択したステータスへの変更は許可されていません。";
    }

    return "この問い合わせのステータスを変更する権限がありません。";
  }

  if (statusCode === 404) {
    return "対象の問い合わせが見つかりません。";
  }

  if (statusCode === 500) {
    return "サーバーでエラーが発生しました。";
  }

  return defaultMessage;
}
