import { useState } from "react";
import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { InquiryMessageForm } from "./InquiryMessageForm";
import { INQUIRY_MESSAGE_MAX_LENGTH } from "../utils/inquiry-message";

/**
 * 問い合わせ返信フォームのコンポーネントテスト。
 */
describe("InquiryMessageForm", () => {
  /**
   * テスト用の共通レンダリング処理。
   */
  function renderForm(messageBody = "", isSending = false) {
    const onMessageBodyChange = vi.fn();
    const onSendMessage = vi.fn();

    render(
      <InquiryMessageForm
        messageBody={messageBody}
        onMessageBodyChange={onMessageBodyChange}
        onSendMessage={onSendMessage}
        isSending={isSending}
      />,
    );

    return {
      onMessageBodyChange,
      onSendMessage,
      input: screen.getByRole("textbox", {
        name: "メッセージ",
      }),
      sendButton: screen.getByRole("button", {
        name: isSending ? "送信中..." : "返信を送信",
      }),
    };
  }

  it("入力欄と送信ボタンを表示する", () => {
    const { input, sendButton } = renderForm();

    expect(input).toBeInTheDocument();
    expect(sendButton).toBeInTheDocument();
  });

  it("未入力の場合は送信ボタンを無効化する", () => {
    const { input, sendButton } = renderForm();

    expect(input).toBeEnabled();
    expect(sendButton).toBeDisabled();
  });

  it("空白のみの場合は送信ボタンを無効化する", () => {
    const { sendButton } = renderForm("   ");

    expect(sendButton).toBeDisabled();
  });

  it("正常なメッセージの場合は送信ボタンを有効化する", () => {
    const { sendButton } = renderForm("現在2床空いています。");

    expect(sendButton).toBeEnabled();
  });

  it("正規化後の文字数を表示する", () => {
    renderForm("  あいう  ");

    expect(screen.getByText("3 / 2,000")).toBeInTheDocument();
  });

  it("絵文字をUnicodeコードポイント単位で表示する", () => {
    renderForm("あ😀い😀");

    expect(screen.getByText("4 / 2,000")).toBeInTheDocument();
  });

  it("最大文字数ちょうどの場合は送信を許可する", () => {
    const body = "あ".repeat(INQUIRY_MESSAGE_MAX_LENGTH);

    const { sendButton } = renderForm(body);

    expect(sendButton).toBeEnabled();

    expect(screen.getByText("2,000 / 2,000")).toBeInTheDocument();
  });

  it("最大文字数を超える場合はエラーを表示して送信を禁止する", () => {
    const body = "あ".repeat(INQUIRY_MESSAGE_MAX_LENGTH + 1);

    const { input, sendButton } = renderForm(body);

    expect(input).toBeEnabled();
    expect(input).toHaveAttribute("aria-invalid", "true");
    expect(sendButton).toBeDisabled();

    expect(
      screen.getByText("メッセージは2,000文字以内で入力してください。"),
    ).toBeInTheDocument();

    expect(screen.getByText("2,001 / 2,000")).toBeInTheDocument();
  });

  it("送信中は入力欄と送信ボタンを無効化する", () => {
    const { input, sendButton } = renderForm("返信テストです。", true);

    expect(input).toBeDisabled();
    expect(sendButton).toBeDisabled();

    expect(sendButton).toHaveTextContent("送信中...");
  });

  it("入力変更時にonMessageBodyChangeを呼び出す", () => {
    const { input, onMessageBodyChange } = renderForm();

    fireEvent.change(input, {
      target: {
        value: "返信テストです。",
      },
    });

    expect(onMessageBodyChange).toHaveBeenCalledWith("返信テストです。");
  });

  it("送信ボタン押下時にonSendMessageを呼び出す", () => {
    const { sendButton, onSendMessage } = renderForm("返信テストです。");

    fireEvent.click(sendButton);

    expect(onSendMessage).toHaveBeenCalledTimes(1);
  });

  it("送信ボタンが無効な場合はonSendMessageを呼び出さない", () => {
    const { sendButton, onSendMessage } = renderForm();

    fireEvent.click(sendButton);

    expect(onSendMessage).not.toHaveBeenCalled();
  });

  it("入力内容の変更に応じて文字数と送信可否を更新する", () => {
    function TestForm() {
      const [messageBody, setMessageBody] = useState("");

      return (
        <InquiryMessageForm
          messageBody={messageBody}
          onMessageBodyChange={setMessageBody}
          onSendMessage={vi.fn()}
          isSending={false}
        />
      );
    }

    render(<TestForm />);

    const input = screen.getByRole("textbox", {
      name: "メッセージ",
    });

    const sendButton = screen.getByRole("button", {
      name: "返信を送信",
    });

    expect(sendButton).toBeDisabled();

    fireEvent.change(input, {
      target: { value: "あ😀い" },
    });

    expect(screen.getByText("3 / 2,000")).toBeInTheDocument();

    expect(sendButton).toBeEnabled();

    fireEvent.change(input, {
      target: {
        value: "あ".repeat(INQUIRY_MESSAGE_MAX_LENGTH + 1),
      },
    });

    expect(sendButton).toBeDisabled();

    fireEvent.change(input, {
      target: { value: "あいう" },
    });

    expect(sendButton).toBeEnabled();

    expect(input).not.toHaveAttribute("aria-invalid", "true");
  });
});
