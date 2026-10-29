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
import { markInquiryRead } from "../api/mark-inquiry-read";
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
   * 取得した問い合わせを画面へ反映し、
   * 実際に取得・表示した最後のメッセージまで既読にする。
   */
  const applyInquiry = async (response: Inquiry) => {
    setInquiry(response);
    setStatus(response.status);

    const lastMessage = response.messages.at(-1);

    if (lastMessage) {
      await markInquiryRead(response.inquiryId, lastMessage.messageId);
    }
  };

  /**
   * 問い合わせ詳細を再取得する。
   */
  const refreshInquiry = async (targetInquiryId: string) => {
    try {
      const response = await getInquiry(targetInquiryId);

      await applyInquiry(response);
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
      .then(async ([inquiryResponse, userResponse]) => {
        if (cancelled) {
          return;
        }

        await applyInquiry(inquiryResponse);

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
    <Box
      sx={{
        minHeight: "100vh",
        background:
          "linear-gradient(135deg, #EEF2FF 0%, #FFF1EC 55%, #E8F7F5 100%)",
        py: { xs: 3, sm: 5 },
      }}
    >
      <Container
        maxWidth="md"
        sx={{
          px: { xs: 2, sm: 3 },
        }}
      >
        <Stack spacing={3}>
          {/* ヘッダー */}
          <Box sx={{ mb: 2 }}>
            <Button
              onClick={() => navigate("/inquiries")}
              sx={{
                mb: 3,
                color: "text.secondary",
                fontWeight: 700,
                textTransform: "none",
                "&:hover": {
                  bgcolor: "#EEF2FF",
                  color: "#6366F1",
                },
              }}
            >
              ← 問い合わせ一覧へ戻る
            </Button>

            <Typography
              variant="overline"
              sx={{
                color: "#6366F1",
                fontWeight: 800,
                letterSpacing: 1.5,
              }}
            >
              INQUIRY DETAILS
            </Typography>

            <Box
              sx={{
                display: "flex",
                alignItems: "flex-start",
                justifyContent: "space-between",
                flexWrap: "wrap",
                gap: 2,
                mt: 1,
              }}
            >
              <Typography
                variant="h4"
                component="h1"
                sx={{
                  fontWeight: 800,
                  fontSize: { xs: "1.5rem", sm: "2rem" },
                  lineHeight: 1.4,
                  overflowWrap: "anywhere",
                  minWidth: 0,
                  flex: 1,
                }}
              >
                💬 {inquiry.subject}
              </Typography>

              <Chip
                label={getStatusLabel(inquiry.status)}
                size="medium"
                sx={{
                  fontWeight: 800,
                  borderRadius: 2,
                  bgcolor:
                    inquiry.status === "OPEN"
                      ? "#FEF3C7"
                      : inquiry.status === "IN_PROGRESS"
                        ? "#DBEAFE"
                        : inquiry.status === "ANSWERED"
                          ? "#D1FAE5"
                          : inquiry.status === "CANCELLED"
                            ? "#FEE2E2"
                            : "#F1F5F9",
                  color:
                    inquiry.status === "OPEN"
                      ? "#92400E"
                      : inquiry.status === "IN_PROGRESS"
                        ? "#1D4ED8"
                        : inquiry.status === "ANSWERED"
                          ? "#065F46"
                          : inquiry.status === "CANCELLED"
                            ? "#991B1B"
                            : "#475569",
                }}
              />
            </Box>

            <Typography
              variant="body2"
              sx={{
                mt: 2,
                color: "text.secondary",
                lineHeight: 1.8,
              }}
            >
              問い合わせ内容の確認、対応状況の更新、メッセージのやり取りができます。
            </Typography>
          </Box>

          {error && <Alert severity="error">{error}</Alert>}

          {/* ステータス */}
          <Card
            variant="outlined"
            sx={{
              borderRadius: 3,
              borderColor: "divider",
              boxShadow: "0 4px 16px rgba(99, 102, 241, 0.04)",
              overflow: "hidden",
            }}
          >
            <CardContent
              sx={{
                p: { xs: 2.5, sm: 3 },
                "&:last-child": {
                  pb: { xs: 2.5, sm: 3 },
                },
              }}
            >
              <Box sx={{ mb: 3 }}>
                <Typography
                  variant="h6"
                  sx={{
                    fontWeight: 800,
                    display: "flex",
                    alignItems: "center",
                    gap: 1,
                  }}
                >
                  📋 対応状況
                </Typography>

                <Typography
                  variant="body2"
                  sx={{
                    mt: 0.75,
                    color: "text.secondary",
                  }}
                >
                  問い合わせの対応ステータスを変更できます。
                </Typography>
              </Box>

              <Box
                sx={{
                  p: { xs: 2, sm: 2.5 },
                  borderRadius: 2.5,
                  bgcolor: "#F8FAFC",
                }}
              >
                <Stack
                  direction={{
                    xs: "column",
                    sm: "row",
                  }}
                  spacing={2}
                  sx={{
                    alignItems: {
                      xs: "stretch",
                      sm: "center",
                    },
                  }}
                >
                  <TextField
                    select
                    label="ステータス"
                    value={status}
                    onChange={(event) =>
                      setStatus(event.target.value as InquiryStatus)
                    }
                    fullWidth
                    size="small"
                    sx={{
                      bgcolor: "background.paper",
                      "& .MuiOutlinedInput-root": {
                        borderRadius: 2,
                      },
                    }}
                  >
                    <MenuItem value="OPEN">未対応</MenuItem>
                    <MenuItem value="IN_PROGRESS">対応中</MenuItem>
                    <MenuItem value="ANSWERED">回答済み</MenuItem>
                    <MenuItem value="CLOSED">完了</MenuItem>
                    <MenuItem value="CANCELLED">キャンセル</MenuItem>
                  </TextField>

                  <Button
                    variant="contained"
                    onClick={() => {
                      void handleUpdateStatus();
                    }}
                    disabled={isUpdatingStatus || status === inquiry.status}
                    sx={{
                      minWidth: { xs: "100%", sm: 160 },
                      minHeight: 40,
                      borderRadius: 2,
                      fontWeight: 800,
                      textTransform: "none",
                      boxShadow: "none",
                      bgcolor: "#6366F1",
                      "&:hover": {
                        bgcolor: "#4F46E5",
                        boxShadow: "none",
                      },
                    }}
                  >
                    {isUpdatingStatus ? "更新中..." : "ステータス更新"}
                  </Button>
                </Stack>
              </Box>
            </CardContent>
          </Card>

          {/* メッセージ履歴 */}
          <Card
            variant="outlined"
            sx={{
              borderRadius: 3,
              borderColor: "divider",
              boxShadow: "0 4px 16px rgba(99, 102, 241, 0.04)",
              overflow: "hidden",
            }}
          >
            <CardContent
              sx={{
                p: { xs: 2.5, sm: 3 },
                "&:last-child": {
                  pb: { xs: 2.5, sm: 3 },
                },
              }}
            >
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  flexWrap: "wrap",
                  gap: 2,
                  mb: 3,
                }}
              >
                <Box>
                  <Typography
                    variant="h6"
                    sx={{
                      fontWeight: 800,
                      display: "flex",
                      alignItems: "center",
                      gap: 1,
                    }}
                  >
                    💬 メッセージ履歴
                  </Typography>

                  <Typography
                    variant="body2"
                    sx={{
                      mt: 0.75,
                      color: "text.secondary",
                    }}
                  >
                    施設とケアマネジャーのやり取りを確認できます。
                  </Typography>
                </Box>

                <Chip
                  label={`${inquiry.messages.length}件`}
                  size="small"
                  sx={{
                    fontWeight: 800,
                    bgcolor: "#EEF2FF",
                    color: "#6366F1",
                    borderRadius: 2,
                  }}
                />
              </Box>

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
          <Card
            variant="outlined"
            sx={{
              borderRadius: 3,
              borderColor: "divider",
              boxShadow: "0 4px 16px rgba(99, 102, 241, 0.04)",
              overflow: "hidden",
            }}
          >
            <CardContent
              sx={{
                p: { xs: 2.5, sm: 3 },
                "&:last-child": {
                  pb: { xs: 2.5, sm: 3 },
                },
              }}
            >
              <Box sx={{ mb: 3 }}>
                <Typography
                  variant="h6"
                  sx={{
                    fontWeight: 800,
                  }}
                >
                  ✉️ 返信メッセージ
                </Typography>

                <Typography
                  variant="body2"
                  sx={{
                    mt: 0.75,
                    color: "text.secondary",
                  }}
                >
                  問い合わせ相手にメッセージを送信できます。
                </Typography>
              </Box>

              <Stack spacing={2.5}>
                <TextField
                  label="メッセージ"
                  value={messageBody}
                  onChange={(event) => setMessageBody(event.target.value)}
                  placeholder="返信内容を入力してください"
                  multiline
                  minRows={4}
                  fullWidth
                  sx={{
                    "& .MuiOutlinedInput-root": {
                      borderRadius: 2.5,
                      bgcolor: "#F8FAFC",
                      alignItems: "flex-start",
                    },
                  }}
                />

                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "flex-end",
                  }}
                >
                  <Button
                    variant="contained"
                    onClick={() => {
                      void handleSendMessage();
                    }}
                    disabled={isSending || messageBody.trim() === ""}
                    sx={{
                      minWidth: { xs: "100%", sm: 180 },
                      minHeight: 44,
                      borderRadius: 2.5,
                      px: 3,
                      fontWeight: 800,
                      textTransform: "none",
                      bgcolor: "#6366F1",
                      boxShadow: "0 4px 12px rgba(99, 102, 241, 0.15)",
                      "&:hover": {
                        bgcolor: "#4F46E5",
                        boxShadow: "0 6px 16px rgba(99, 102, 241, 0.2)",
                      },
                    }}
                  >
                    {isSending ? "送信中..." : "返信を送信"}
                  </Button>
                </Box>
              </Stack>
            </CardContent>
          </Card>
        </Stack>
      </Container>
    </Box>
  );
}
