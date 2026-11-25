import { describe, expect, it } from "vitest";

import { getInquiryMessageSendErrorMessage } from "./inquiry-message-send-error";

/**
 * HTTPレスポンスを持つAxiosエラーのテストデータを生成する。
 */
function createAxiosResponseError(status: number, message?: unknown) {
  return {
    isAxiosError: true,
    response: {
      status,
      data: {
        message,
      },
    },
  };
}

describe("getInquiryMessageSendErrorMessage", () => {
  describe("400 Bad Request", () => {
    it("文字列形式の空文字エラーを変換する", () => {
      const error = createAxiosResponseError(
        400,
        "Message body must not be empty",
      );

      expect(getInquiryMessageSendErrorMessage(error)).toBe(
        "メッセージを入力してください。",
      );
    });

    it("配列形式の空文字エラーを変換する", () => {
      const error = createAxiosResponseError(400, [
        "Message body must not be empty",
      ]);

      expect(getInquiryMessageSendErrorMessage(error)).toBe(
        "メッセージを入力してください。",
      );
    });

    it("文字列形式の最大文字数超過エラーを変換する", () => {
      const error = createAxiosResponseError(
        400,
        "Message body must not exceed 2000 characters",
      );

      expect(getInquiryMessageSendErrorMessage(error)).toBe(
        "メッセージは2,000文字以内で入力してください。",
      );
    });

    it("配列形式の最大文字数超過エラーを変換する", () => {
      const error = createAxiosResponseError(400, [
        "Message body must not exceed 2000 characters",
      ]);

      expect(getInquiryMessageSendErrorMessage(error)).toBe(
        "メッセージは2,000文字以内で入力してください。",
      );
    });

    it("複数のエラーメッセージから対象エラーを判定する", () => {
      const error = createAxiosResponseError(400, [
        "Unknown validation error",
        "Message body must not exceed 2000 characters",
      ]);

      expect(getInquiryMessageSendErrorMessage(error)).toBe(
        "メッセージは2,000文字以内で入力してください。",
      );
    });

    it("配列内の文字列以外の値を無視する", () => {
      const error = createAxiosResponseError(400, [
        null,
        123,
        {},
        "Message body must not be empty",
      ]);

      expect(getInquiryMessageSendErrorMessage(error)).toBe(
        "メッセージを入力してください。",
      );
    });

    it("その他のバリデーションエラーを変換する", () => {
      const error = createAxiosResponseError(
        400,
        "Message body must be a string",
      );

      expect(getInquiryMessageSendErrorMessage(error)).toBe(
        "メッセージの入力内容を確認してください。",
      );
    });

    it("エラーメッセージが存在しない場合も処理できる", () => {
      const error = createAxiosResponseError(400);

      expect(getInquiryMessageSendErrorMessage(error)).toBe(
        "メッセージの入力内容を確認してください。",
      );
    });
  });

  describe("HTTPステータス別のエラー", () => {
    it("401認証エラーを変換する", () => {
      const error = createAxiosResponseError(401, "Unauthorized");

      expect(getInquiryMessageSendErrorMessage(error)).toBe(
        "ログイン状態を確認してください。",
      );
    });

    it("403アクセス権限エラーを変換する", () => {
      const error = createAxiosResponseError(
        403,
        "You do not have permission to access this inquiry",
      );

      expect(getInquiryMessageSendErrorMessage(error)).toBe(
        "この問い合わせに返信する権限がありません。",
      );
    });

    it("404問い合わせ不存在エラーを変換する", () => {
      const error = createAxiosResponseError(404, "Inquiry not found");

      expect(getInquiryMessageSendErrorMessage(error)).toBe(
        "対象の問い合わせが見つかりません。",
      );
    });

    it("429リクエスト過多エラーを変換する", () => {
      const error = createAxiosResponseError(429, "Too Many Requests");

      expect(getInquiryMessageSendErrorMessage(error)).toBe(
        "送信回数が多すぎます。時間をおいて再度お試しください。",
      );
    });

    it.each([500, 502, 503, 504])("%iサーバーエラーを変換する", (status) => {
      const error = createAxiosResponseError(status);

      expect(getInquiryMessageSendErrorMessage(error)).toBe(
        "サーバーでエラーが発生しました。",
      );
    });

    it("未定義のHTTPステータスにはデフォルトメッセージを返す", () => {
      const error = createAxiosResponseError(418, "Unknown error");

      expect(getInquiryMessageSendErrorMessage(error)).toBe(
        "メッセージの送信に失敗しました。",
      );
    });
  });

  describe("通信エラー", () => {
    it("レスポンスがない場合は送信履歴の確認を促す", () => {
      const error = {
        isAxiosError: true,
        request: {},
        message: "Network Error",
        code: "ERR_NETWORK",
      };

      expect(getInquiryMessageSendErrorMessage(error)).toBe(
        "通信エラーが発生しました。送信済みの可能性があるため、画面を再読み込みして履歴を確認してください。",
      );
    });

    it("タイムアウト時も送信履歴の確認を促す", () => {
      const error = {
        isAxiosError: true,
        request: {},
        message: "timeout exceeded",
        code: "ECONNABORTED",
      };

      expect(getInquiryMessageSendErrorMessage(error)).toBe(
        "通信エラーが発生しました。送信済みの可能性があるため、画面を再読み込みして履歴を確認してください。",
      );
    });

    it("リクエストもレスポンスもない場合はデフォルトメッセージを返す", () => {
      const error = {
        isAxiosError: true,
        message: "Request configuration error",
      };

      expect(getInquiryMessageSendErrorMessage(error)).toBe(
        "メッセージの送信に失敗しました。",
      );
    });
  });

  describe("Axios以外のエラー", () => {
    it("通常のErrorオブジェクトを処理する", () => {
      const error = new Error("Unexpected error");

      expect(getInquiryMessageSendErrorMessage(error)).toBe(
        "メッセージの送信に失敗しました。",
      );
    });

    it("nullを安全に処理する", () => {
      expect(getInquiryMessageSendErrorMessage(null)).toBe(
        "メッセージの送信に失敗しました。",
      );
    });

    it("undefinedを安全に処理する", () => {
      expect(getInquiryMessageSendErrorMessage(undefined)).toBe(
        "メッセージの送信に失敗しました。",
      );
    });

    it("文字列を安全に処理する", () => {
      expect(getInquiryMessageSendErrorMessage("Unknown error")).toBe(
        "メッセージの送信に失敗しました。",
      );
    });
  });
});
