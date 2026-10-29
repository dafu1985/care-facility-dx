import { Box, Stack, Typography } from "@mui/material";

import type { AuthMeResponse } from "../../auth/types/auth";
import type { InquiryMessage, InquiryStatus } from "../types/inquiry";
import { getStatusLabel } from "../utils/inquiry-status";

type InquiryMessageListProps = {
  messages: InquiryMessage[];
  currentUser: AuthMeResponse | null;
};

/**
 * 日時を日本語形式で表示する。
 */
function formatDateTime(value: string): string {
  return new Date(value).toLocaleString("ja-JP");
}

/**
 * システムメッセージかどうかを判定する。
 */
function isSystemMessage(message: InquiryMessage): boolean {
  return message.type === "STATUS_CHANGE" || message.type === "SYSTEM";
}

/**
 * 過去に保存された英語のステータス変更履歴を日本語表示する。
 * DBに保存されたメッセージ本文は変更しない。
 */
function getSystemMessageBody(message: InquiryMessage): string {
  if (message.type !== "STATUS_CHANGE") {
    return message.body;
  }

  const match = message.body.match(
    /^Status changed from (OPEN|IN_PROGRESS|ANSWERED|CLOSED|CANCELLED) to (OPEN|IN_PROGRESS|ANSWERED|CLOSED|CANCELLED)$/,
  );

  if (!match) {
    return message.body;
  }

  const previousStatus = match[1] as InquiryStatus;
  const nextStatus = match[2] as InquiryStatus;

  return `対応状況を「${getStatusLabel(previousStatus)}」から「${getStatusLabel(nextStatus)}」に変更しました。`;
}

/**
 * 問い合わせメッセージ一覧。
 *
 * 表示処理のみを担当し、
 * API通信・既読管理・送信処理は親コンポーネントに任せる。
 */
export function InquiryMessageList({
  messages,
  currentUser,
}: InquiryMessageListProps) {
  if (messages.length === 0) {
    return (
      <Typography color="text.secondary">メッセージはありません。</Typography>
    );
  }

  return (
    <Stack spacing={2} sx={{ mt: 2 }}>
      {messages.map((message) => {
        if (isSystemMessage(message)) {
          return (
            <Box
              key={message.messageId}
              sx={{
                display: "flex",
                justifyContent: "center",
                width: "100%",
                py: 0.5,
              }}
            >
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  flexWrap: "wrap",
                  justifyContent: "center",
                  gap: 1,
                  px: 2,
                  py: 1,
                  maxWidth: "95%",
                  borderRadius: 3,
                  bgcolor: "#F8FAFC",
                  border: "1px solid #E2E8F0",
                }}
              >
                <Typography
                  variant="caption"
                  sx={{
                    color: "#64748B",
                    fontWeight: 600,
                    textAlign: "center",
                    overflowWrap: "anywhere",
                  }}
                >
                  ⚙️ {getSystemMessageBody(message)}
                </Typography>

                <Typography
                  variant="caption"
                  sx={{
                    color: "#94A3B8",
                    fontSize: "0.7rem",
                    whiteSpace: "nowrap",
                  }}
                >
                  {formatDateTime(message.createdAt)}
                </Typography>
              </Box>
            </Box>
          );
        }

        const isOwnMessage = message.senderUserId === currentUser?.userId;

        return (
          <Box
            key={message.messageId}
            sx={{
              display: "flex",
              justifyContent: isOwnMessage ? "flex-end" : "flex-start",
              width: "100%",
            }}
          >
            <Box
              sx={{
                maxWidth: {
                  xs: "90%",
                  sm: "75%",
                },
                minWidth: 0,
                px: { xs: 2, sm: 2.5 },
                py: 2,
                borderRadius: "18px",
                borderTopRightRadius: isOwnMessage ? "6px" : "18px",
                borderTopLeftRadius: isOwnMessage ? "18px" : "6px",
                bgcolor: isOwnMessage ? "#6366F1" : "#F1F5F9",
                color: isOwnMessage ? "#FFFFFF" : "#1E293B",
                boxShadow: isOwnMessage
                  ? "0 4px 12px rgba(99, 102, 241, 0.15)"
                  : "0 2px 8px rgba(15, 23, 42, 0.04)",
                overflowWrap: "anywhere",
              }}
            >
              <Typography
                variant="caption"
                sx={{
                  display: "block",
                  mb: 0.5,
                  opacity: 0.8,
                }}
              >
                {isOwnMessage
                  ? currentUser?.role === "FACILITY"
                    ? "施設"
                    : "ケアマネ"
                  : currentUser?.role === "FACILITY"
                    ? "ケアマネ"
                    : "施設"}
              </Typography>

              <Typography sx={{ whiteSpace: "pre-wrap" }}>
                {message.body}
              </Typography>

              <Typography
                variant="caption"
                sx={{
                  display: "block",
                  mt: 1,
                  textAlign: "right",
                  opacity: 0.7,
                }}
              >
                {formatDateTime(message.createdAt)}
              </Typography>
            </Box>
          </Box>
        );
      })}
    </Stack>
  );
}
