import axios from "axios";

import { INQUIRY_MESSAGE_MAX_LENGTH } from "./inquiry-message";

/**
 * 問い合わせメッセージ送信時のエラーを
 * 日本語メッセージに変換する。
 */
export function getInquiryMessageSendErrorMessage(error: unknown): string {
  const defaultMessage = "メッセージの送信に失敗しました。";

  if (!axios.isAxiosError(error)) {
    return defaultMessage;
  }

  const statusCode = error.response?.status;
  const message: unknown = error.response?.data?.message;

  /**
   * NestJSのValidationPipeではmessageが
   * 文字列配列として返却される場合がある。
   */
  const messages: string[] =
    typeof message === "string"
      ? [message]
      : Array.isArray(message)
        ? message.filter((item): item is string => typeof item === "string")
        : [];

  if (statusCode === 400) {
    if (messages.includes("Message body must not be empty")) {
      return "メッセージを入力してください。";
    }

    if (
      messages.some((item) => item.startsWith("Message body must not exceed"))
    ) {
      return `メッセージは${INQUIRY_MESSAGE_MAX_LENGTH.toLocaleString("ja-JP")}文字以内で入力してください。`;
    }

    return "メッセージの入力内容を確認してください。";
  }

  if (statusCode === 401) {
    return "ログイン状態を確認してください。";
  }

  if (statusCode === 403) {
    return "この問い合わせに返信する権限がありません。";
  }

  if (statusCode === 404) {
    return "対象の問い合わせが見つかりません。";
  }

  if (statusCode === 429) {
    return "送信回数が多すぎます。時間をおいて再度お試しください。";
  }

  if (statusCode !== undefined && statusCode >= 500) {
    return "サーバーでエラーが発生しました。";
  }

  if (!error.response && error.request) {
    return "通信エラーが発生しました。送信済みの可能性があるため、画面を再読み込みして履歴を確認してください。";
  }

  return defaultMessage;
}
