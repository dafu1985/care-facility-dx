import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { InquiryStatusForm } from "./InquiryStatusForm";

describe("InquiryStatusForm", () => {
  it("施設職員はOPENからIN_PROGRESSに変更できる", async () => {
    const user = userEvent.setup();
    const onStatusChange = vi.fn();
    const onUpdateStatus = vi.fn();

    render(
      <InquiryStatusForm
        status="OPEN"
        currentStatus="OPEN"
        role="FACILITY"
        onStatusChange={onStatusChange}
        onUpdateStatus={onUpdateStatus}
        isUpdatingStatus={false}
      />,
    );

    const select = screen.getByRole("combobox", {
      name: "ステータス",
    });

    await user.click(select);

    const option = await screen.findByRole("option", {
      name: "対応中",
    });

    await user.click(option);

    expect(onStatusChange).toHaveBeenCalledWith("IN_PROGRESS");
  });
  it("施設職員はOPENからANSWEREDへ直接変更できない", async () => {
    const user = userEvent.setup();
    const onStatusChange = vi.fn();
    const onUpdateStatus = vi.fn();

    render(
      <InquiryStatusForm
        status="OPEN"
        currentStatus="OPEN"
        role="FACILITY"
        onStatusChange={onStatusChange}
        onUpdateStatus={onUpdateStatus}
        isUpdatingStatus={false}
      />,
    );

    const select = screen.getByRole("combobox", {
      name: "ステータス",
    });

    await user.click(select);

    expect(
      screen.queryByRole("option", { name: "回答済み" }),
    ).not.toBeInTheDocument();

    expect(onStatusChange).not.toHaveBeenCalled();
    expect(onUpdateStatus).not.toHaveBeenCalled();
  });
  it("ケアマネジャーはANSWEREDからCLOSEDに変更できる", async () => {
    const user = userEvent.setup();
    const onStatusChange = vi.fn();
    const onUpdateStatus = vi.fn();

    render(
      <InquiryStatusForm
        status="ANSWERED"
        currentStatus="ANSWERED"
        role="CARE_MANAGER"
        onStatusChange={onStatusChange}
        onUpdateStatus={onUpdateStatus}
        isUpdatingStatus={false}
      />,
    );

    const select = screen.getByRole("combobox", {
      name: "ステータス",
    });

    await user.click(select);

    const option = await screen.findByRole("option", {
      name: "完了",
    });

    await user.click(option);

    expect(onStatusChange).toHaveBeenCalledWith("CLOSED");

    expect(
      screen.queryByRole("option", { name: "対応中" }),
    ).not.toBeInTheDocument();
  });
  it("ケアマネジャーはOPENからCANCELLEDに変更できる", async () => {
    const user = userEvent.setup();
    const onStatusChange = vi.fn();
    const onUpdateStatus = vi.fn();

    render(
      <InquiryStatusForm
        status="OPEN"
        currentStatus="OPEN"
        role="CARE_MANAGER"
        onStatusChange={onStatusChange}
        onUpdateStatus={onUpdateStatus}
        isUpdatingStatus={false}
      />,
    );

    const select = screen.getByRole("combobox", {
      name: "ステータス",
    });

    await user.click(select);

    const option = await screen.findByRole("option", {
      name: "キャンセル",
    });

    await user.click(option);

    expect(onStatusChange).toHaveBeenCalledWith("CANCELLED");

    expect(
      screen.queryByRole("option", { name: "対応中" }),
    ).not.toBeInTheDocument();
  });
  it("ステータスが変更されていない場合は更新ボタンが無効になる", () => {
    const onStatusChange = vi.fn();
    const onUpdateStatus = vi.fn();

    render(
      <InquiryStatusForm
        status="OPEN"
        currentStatus="OPEN"
        role="FACILITY"
        onStatusChange={onStatusChange}
        onUpdateStatus={onUpdateStatus}
        isUpdatingStatus={false}
      />,
    );

    const updateButton = screen.getByRole("button", {
      name: "ステータス更新",
    });

    expect(updateButton).toBeDisabled();
    expect(onUpdateStatus).not.toHaveBeenCalled();
  });
  it("許可されたステータスを選択すると更新ボタンが有効になる", async () => {
    const user = userEvent.setup();
    const onStatusChange = vi.fn();
    const onUpdateStatus = vi.fn();

    const { rerender } = render(
      <InquiryStatusForm
        status="OPEN"
        currentStatus="OPEN"
        role="FACILITY"
        onStatusChange={onStatusChange}
        onUpdateStatus={onUpdateStatus}
        isUpdatingStatus={false}
      />,
    );

    const updateButton = screen.getByRole("button", {
      name: "ステータス更新",
    });

    // 変更前は無効
    expect(updateButton).toBeDisabled();

    // 施設職員が「対応中」を選択
    await user.click(screen.getByRole("combobox", { name: "ステータス" }));

    await user.click(await screen.findByRole("option", { name: "対応中" }));

    expect(onStatusChange).toHaveBeenCalledWith("IN_PROGRESS");

    // 親コンポーネントによる状態更新を再現
    rerender(
      <InquiryStatusForm
        status="IN_PROGRESS"
        currentStatus="OPEN"
        role="FACILITY"
        onStatusChange={onStatusChange}
        onUpdateStatus={onUpdateStatus}
        isUpdatingStatus={false}
      />,
    );

    // 変更後は有効
    expect(updateButton).toBeEnabled();

    // 更新ボタンをクリック
    await user.click(updateButton);

    expect(onUpdateStatus).toHaveBeenCalledTimes(1);
  });
  it("更新処理中は更新ボタンが無効になる", async () => {
    const onStatusChange = vi.fn();
    const onUpdateStatus = vi.fn();

    render(
      <InquiryStatusForm
        status="IN_PROGRESS"
        currentStatus="OPEN"
        role="FACILITY"
        onStatusChange={onStatusChange}
        onUpdateStatus={onUpdateStatus}
        isUpdatingStatus={true}
      />,
    );

    const updateButton = screen.getByRole("button", {
      name: "更新中...",
    });

    expect(updateButton).toBeDisabled();

    // 更新ボタンが無効化されていることを確認
    expect(updateButton).toBeDisabled();

    // 更新処理が呼び出されていないことを確認
    expect(onUpdateStatus).not.toHaveBeenCalled();
    // 更新中はステータス選択欄も無効
    expect(
      screen.getByRole("combobox", {
        name: "ステータス",
      }),
    ).toHaveAttribute("aria-disabled", "true");
  });
});
