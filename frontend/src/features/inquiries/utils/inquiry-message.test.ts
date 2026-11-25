import { describe, expect, it } from "vitest";

import {
  INQUIRY_MESSAGE_MAX_LENGTH,
  normalizeInquiryMessageBody,
  getInquiryMessageLength,
  isInquiryMessageTooLong,
  isInquiryMessageValid,
} from "./inquiry-message";

describe("inquiry-message", () => {
  describe("normalizeInquiryMessageBody", () => {
    it("前後の空白を除去する", () => {
      expect(normalizeInquiryMessageBody("  返信テストです。  ")).toBe(
        "返信テストです。",
      );
    });

    it("本文途中の改行を維持する", () => {
      expect(normalizeInquiryMessageBody("  1行目\n2行目  ")).toBe(
        "1行目\n2行目",
      );
    });

    it("空白や改行のみの場合は空文字を返す", () => {
      expect(normalizeInquiryMessageBody(" \n\t\r\n ")).toBe("");
    });
  });

  describe("getInquiryMessageLength", () => {
    it("日本語の文字数を正しく取得する", () => {
      expect(getInquiryMessageLength("あいうえお")).toBe(5);
    });

    it("前後の空白を除去した文字数を取得する", () => {
      expect(getInquiryMessageLength("  あいう  ")).toBe(3);
    });

    it("絵文字をUnicodeコードポイント単位で判定する", () => {
      expect(getInquiryMessageLength("😀😀😀")).toBe(3);
    });

    it("日本語と絵文字が混在していても正しく判定する", () => {
      expect(getInquiryMessageLength("あ😀い😀")).toBe(4);
    });

    it("空白のみの場合は0を返す", () => {
      expect(getInquiryMessageLength("   ")).toBe(0);
    });

    it("本文途中の改行を文字数に含める", () => {
      expect(getInquiryMessageLength("あ\nい")).toBe(3);
    });
  });

  describe("isInquiryMessageTooLong", () => {
    it("最大文字数ちょうどの場合はfalseを返す", () => {
      const body = "あ".repeat(INQUIRY_MESSAGE_MAX_LENGTH);

      expect(isInquiryMessageTooLong(body)).toBe(false);
    });

    it("最大文字数を超える場合はtrueを返す", () => {
      const body = "あ".repeat(INQUIRY_MESSAGE_MAX_LENGTH + 1);

      expect(isInquiryMessageTooLong(body)).toBe(true);
    });

    it("前後の空白を除去して最大文字数を判定する", () => {
      const body = `  ${"あ".repeat(INQUIRY_MESSAGE_MAX_LENGTH)}  `;

      expect(isInquiryMessageTooLong(body)).toBe(false);
    });

    it("絵文字でも最大文字数を超える場合はtrueを返す", () => {
      const body = "😀".repeat(INQUIRY_MESSAGE_MAX_LENGTH + 1);

      expect(isInquiryMessageTooLong(body)).toBe(true);
    });
  });

  describe("isInquiryMessageValid", () => {
    it("正常なメッセージを許可する", () => {
      expect(isInquiryMessageValid("現在2床空いています。")).toBe(true);
    });

    it("空文字を拒否する", () => {
      expect(isInquiryMessageValid("")).toBe(false);
    });

    it("空白のみのメッセージを拒否する", () => {
      expect(isInquiryMessageValid("   ")).toBe(false);
    });

    it("改行やタブのみのメッセージを拒否する", () => {
      expect(isInquiryMessageValid("\n\t\r\n")).toBe(false);
    });

    it("最大文字数ちょうどのメッセージを許可する", () => {
      const body = "あ".repeat(INQUIRY_MESSAGE_MAX_LENGTH);

      expect(isInquiryMessageValid(body)).toBe(true);
    });

    it("最大文字数を超えるメッセージを拒否する", () => {
      const body = "あ".repeat(INQUIRY_MESSAGE_MAX_LENGTH + 1);

      expect(isInquiryMessageValid(body)).toBe(false);
    });

    it("絵文字2,000個のメッセージを許可する", () => {
      const body = "😀".repeat(INQUIRY_MESSAGE_MAX_LENGTH);

      expect(isInquiryMessageValid(body)).toBe(true);
    });

    it("絵文字2,001個のメッセージを拒否する", () => {
      const body = "😀".repeat(INQUIRY_MESSAGE_MAX_LENGTH + 1);

      expect(isInquiryMessageValid(body)).toBe(false);
    });
  });
});
