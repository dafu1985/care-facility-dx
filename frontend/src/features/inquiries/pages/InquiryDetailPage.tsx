import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  CircularProgress,
  Container,
  MenuItem,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import { getMe } from "../../auth/api/get-me";
import type { AuthMeResponse } from "../../auth/types/auth";

import { addInquiryMessage } from "../api/add-inquiry-message";
import { getInquiry } from "../api/get-inquiry";
import { updateInquiryStatus } from "../api/update-inquiry-status";

import type { Inquiry, InquiryMessage, InquiryStatus } from "../types/inquiry";

/**
 * ステータス表示名。
 */
function getStatusLabel(status: InquiryStatus): string {
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

/**
 * 日時表示。
 */
function formatDateTime(value: string): string {
  return new Date(value).toLocaleString("ja-JP");
}

/**
 * システムメッセージかどうか。
 */
function isSystemMessage(message: InquiryMessage): boolean {
  return message.type === "STATUS_CHANGE" || message.type === "SYSTEM";
}

/**
 * 問い合わせ詳細画面。
 */
export function InquiryDetailPage() {
  const navigate = useNavigate();

  const { inquiryId } = useParams<{
    inquiryId: string;
  }>();

  const [inquiry, setInquiry] = useState<Inquiry | null>(null);

  /**
   * ログインユーザー。
   *
   * senderUserIdと比較して
   * 自分のメッセージかどうか判定する。
   */
  const [currentUser, setCurrentUser] = useState<AuthMeResponse | null>(null);

  const [messageBody, setMessageBody] = useState("");

  const [status, setStatus] = useState<InquiryStatus>("OPEN");

  const [isLoading, setIsLoading] = useState(true);

  const [isSending, setIsSending] = useState(false);

  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);

  const [error, setError] = useState<string | null>(null);

  /**
   * 問い合わせ詳細を再取得する。
   */
  const refreshInquiry = async (targetInquiryId: string) => {
    try {
      const response = await getInquiry(targetInquiryId);

      setInquiry(response);
      setStatus(response.status);
      setError(null);
    } catch (error) {
      console.error("問い合わせ詳細の取得に失敗しました。", error);

      setError("問い合わせ詳細の取得に失敗しました。");
    }
  };

  /**
   * 初回取得。
   *
   * 問い合わせ詳細と
   * ログインユーザー情報を取得する。
   */
  useEffect(() => {
    if (!inquiryId) {
      return;
    }

    let cancelled = false;

    Promise.all([getInquiry(inquiryId), getMe()])
      .then(([inquiryResponse, userResponse]) => {
        if (cancelled) {
          return;
        }

        setInquiry(inquiryResponse);

        setStatus(inquiryResponse.status);

        setCurrentUser(userResponse);

        setError(null);
      })
      .catch((error) => {
        if (cancelled) {
          return;
        }

        console.error("問い合わせ詳細の取得に失敗しました。", error);

        setError("問い合わせ詳細の取得に失敗しました。");
      })
      .finally(() => {
        if (cancelled) {
          return;
        }

        setIsLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [inquiryId]);

  /**
   * 返信送信。
   */
  const handleSendMessage = async () => {
    if (!inquiryId) {
      return;
    }

    const body = messageBody.trim();

    if (body === "") {
      setError("メッセージを入力してください。");

      return;
    }

    try {
      setIsSending(true);
      setError(null);

      await addInquiryMessage(inquiryId, {
        body,
      });

      setMessageBody("");

      await refreshInquiry(inquiryId);
    } catch (error) {
      console.error("メッセージ送信に失敗しました。", error);

      setError("メッセージ送信に失敗しました。");
    } finally {
      setIsSending(false);
    }
  };

  /**
   * ステータス更新。
   */
  const handleUpdateStatus = async () => {
    if (!inquiryId) {
      return;
    }

    try {
      setIsUpdatingStatus(true);
      setError(null);

      await updateInquiryStatus(inquiryId, {
        status,
      });

      await refreshInquiry(inquiryId);
    } catch (error) {
      console.error("ステータス更新に失敗しました。", error);

      setError("ステータス更新に失敗しました。");
    } finally {
      setIsUpdatingStatus(false);
    }
  };

  if (isLoading) {
    return (
      <Box
        sx={{
          minHeight: "100vh",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  if (error && !inquiry) {
    return (
      <Container
        maxWidth="md"
        sx={{
          py: 4,
        }}
      >
        <Alert severity="error">{error}</Alert>
      </Container>
    );
  }

  if (!inquiry) {
    return (
      <Container
        maxWidth="md"
        sx={{
          py: 4,
        }}
      >
        <Alert severity="warning">問い合わせを取得できませんでした。</Alert>
      </Container>
    );
  }

  return (
    <Container
      maxWidth="md"
      sx={{
        py: 4,
      }}
    >
      <Stack spacing={3}>
        {/* ヘッダー */}
        <Box>
          <Button
            onClick={() => navigate("/inquiries")}
            sx={{
              mb: 2,
            }}
          >
            ← 問い合わせ一覧へ戻る
          </Button>

          <Stack
            direction="row"
            spacing={2}
            sx={{
              alignItems: "center",
            }}
          >
            <Typography variant="h4" component="h1">
              {inquiry.subject}
            </Typography>

            <Chip label={getStatusLabel(inquiry.status)} />
          </Stack>
        </Box>

        {error && <Alert severity="error">{error}</Alert>}

        {/* ステータス */}
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              対応状況
            </Typography>

            <Stack
              direction={{
                xs: "column",
                sm: "row",
              }}
              spacing={2}
            >
              <TextField
                select
                label="ステータス"
                value={status}
                onChange={(event) =>
                  setStatus(event.target.value as InquiryStatus)
                }
                fullWidth
              >
                <MenuItem value="OPEN">未対応</MenuItem>

                <MenuItem value="IN_PROGRESS">対応中</MenuItem>

                <MenuItem value="ANSWERED">回答済み</MenuItem>

                <MenuItem value="CLOSED">完了</MenuItem>

                <MenuItem value="CANCELLED">キャンセル</MenuItem>
              </TextField>

              <Button
                variant="outlined"
                onClick={() => {
                  void handleUpdateStatus();
                }}
                disabled={isUpdatingStatus || status === inquiry.status}
              >
                {isUpdatingStatus ? "更新中..." : "ステータス更新"}
              </Button>
            </Stack>
          </CardContent>
        </Card>

        {/* メッセージ履歴 */}
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              メッセージ履歴
            </Typography>

            {inquiry.messages.length === 0 ? (
              <Typography color="text.secondary">
                メッセージはありません。
              </Typography>
            ) : (
              <Stack
                spacing={2}
                sx={{
                  mt: 2,
                }}
              >
                {inquiry.messages.map((message) => {
                  /**
                   * STATUS_CHANGE / SYSTEM。
                   */
                  if (isSystemMessage(message)) {
                    return (
                      <Box
                        key={message.messageId}
                        sx={{
                          display: "flex",
                          justifyContent: "center",
                        }}
                      >
                        <Box
                          sx={{
                            px: 2,
                            py: 1,
                            borderRadius: 2,
                            bgcolor: "action.hover",
                          }}
                        >
                          <Typography variant="caption" color="text.secondary">
                            {message.body}
                            {" ・ "}
                            {formatDateTime(message.createdAt)}
                          </Typography>
                        </Box>
                      </Box>
                    );
                  }

                  /**
                   * ログインユーザー自身が
                   * 送信したメッセージか判定。
                   */
                  const isOwnMessage =
                    message.senderUserId === currentUser?.userId;

                  return (
                    <Box
                      key={message.messageId}
                      sx={{
                        display: "flex",
                        justifyContent: isOwnMessage
                          ? "flex-end"
                          : "flex-start",
                      }}
                    >
                      <Box
                        sx={{
                          maxWidth: "75%",
                          px: 2,
                          py: 1.5,
                          borderRadius: 2,

                          bgcolor: isOwnMessage
                            ? "primary.main"
                            : "action.hover",

                          color: isOwnMessage
                            ? "primary.contrastText"
                            : "text.primary",
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
                          {isOwnMessage ? "施設" : "ケアマネ"}
                        </Typography>

                        <Typography
                          sx={{
                            whiteSpace: "pre-wrap",
                          }}
                        >
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
            )}
          </CardContent>
        </Card>

        {/* 返信 */}
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              返信
            </Typography>

            <Stack spacing={2}>
              <TextField
                label="メッセージ"
                value={messageBody}
                onChange={(event) => setMessageBody(event.target.value)}
                placeholder="返信内容を入力してください"
                multiline
                minRows={4}
                fullWidth
              />

              <Button
                variant="contained"
                onClick={() => {
                  void handleSendMessage();
                }}
                disabled={isSending || messageBody.trim() === ""}
              >
                {isSending ? "送信中..." : "返信を送信"}
              </Button>
            </Stack>
          </CardContent>
        </Card>
      </Stack>
    </Container>
  );
}
