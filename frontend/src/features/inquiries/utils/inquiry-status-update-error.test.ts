import axios, { AxiosError } from "axios";
import { describe, expect, it } from "vitest";

import { getInquiryStatusUpdateErrorMessage } from "./inquiry-status-update-error";

function createAxiosError(status: number, message: string): AxiosError {
  return new AxiosError(
    "Request failed",
    "ERR_BAD_RESPONSE",
    undefined,
    undefined,
    {
      data: { message },
      status,
      statusText: "",
      headers: {},
      config: { headers: new axios.AxiosHeaders() },
    },
  );
}

describe("getInquiryStatusUpdateErrorMessage", () => {
  it("問い合わせへのアクセス権限がない403エラー", () => {
    const error = createAxiosError(
      403,
      "You do not have permission to access this inquiry",
    );

    expect(getInquiryStatusUpdateErrorMessage(error)).toBe(
      "この問い合わせにアクセスする権限がありません。",
    );
  });

  it("施設職員のステータス遷移が禁止されている403エラー", () => {
    const error = createAxiosError(
      403,
      "This status transition is not allowed for facility users",
    );

    expect(getInquiryStatusUpdateErrorMessage(error)).toBe(
      "現在のステータスから選択したステータスへの変更は許可されていません。",
    );
  });

  it("ケアマネジャーのステータス遷移が禁止されている403エラー", () => {
    const error = createAxiosError(
      403,
      "This status transition is not allowed for care manager users",
    );

    expect(getInquiryStatusUpdateErrorMessage(error)).toBe(
      "現在のステータスから選択したステータスへの変更は許可されていません。",
    );
  });

  it("その他の403エラー", () => {
    const error = createAxiosError(
      403,
      "You are not allowed to update inquiry status",
    );

    expect(getInquiryStatusUpdateErrorMessage(error)).toBe(
      "この問い合わせのステータスを変更する権限がありません。",
    );
  });

  it("404エラー", () => {
    const error = createAxiosError(404, "Not Found");

    expect(getInquiryStatusUpdateErrorMessage(error)).toBe(
      "対象の問い合わせが見つかりません。",
    );
  });

  it("500エラー", () => {
    const error = createAxiosError(500, "Internal Server Error");

    expect(getInquiryStatusUpdateErrorMessage(error)).toBe(
      "サーバーでエラーが発生しました。",
    );
  });

  it("通信エラーなどHTTPステータスがない場合", () => {
    const error = new AxiosError("Network Error");

    expect(getInquiryStatusUpdateErrorMessage(error)).toBe(
      "ステータス更新に失敗しました。",
    );
  });

  it("Axios以外のエラー", () => {
    expect(
      getInquiryStatusUpdateErrorMessage(new Error("Unexpected error")),
    ).toBe("ステータス更新に失敗しました。");
  });
});
