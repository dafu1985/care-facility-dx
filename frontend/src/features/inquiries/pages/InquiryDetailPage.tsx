import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  CircularProgress,
  Container,
  Stack,
  Typography,
} from "@mui/material";
import { useEffect, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import { getMe } from "../../auth/api/get-me";
import type { AuthMeResponse } from "../../auth/types/auth";

import { addInquiryMessage } from "../api/add-inquiry-message";
import { getInquiry } from "../api/get-inquiry";
import { markInquiryRead } from "../api/mark-inquiry-read";
import { updateInquiryStatus } from "../api/update-inquiry-status";
import { InquiryStatusChip } from "../components/InquiryStatusChip";
import { InquiryMessageList } from "../components/InquiryMessageList";
import { InquiryMessageForm } from "../components/InquiryMessageForm";
import { InquiryStatusForm } from "../components/InquiryStatusForm";

import type { Inquiry, InquiryStatus } from "../types/inquiry";

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
   * 問い合わせ再取得のリクエスト番号。
   *
   * 古いリクエストの結果が
   * 新しい問い合わせ情報を上書きすることを防ぐ。
   */
  const refreshRequestIdRef = useRef(0);

  /**
   * 問い合わせデータを画面へ反映する。
   *
   * 既読更新は非同期で実行し、
   * 画面表示や操作の完了を待たせない。
   */
  const applyInquiry = (response: Inquiry) => {
    setInquiry(response);
    setStatus(response.status);

    const lastMessage = response.messages.at(-1);

    if (!lastMessage) {
      return;
    }

    void markInquiryRead(response.inquiryId, lastMessage.messageId).catch(
      (error) => {
        console.error("問い合わせの既読更新に失敗しました。", error);
      },
    );
  };

  /**
   * 問い合わせ詳細を再取得する。
   *
   * 最新のリクエスト結果のみ画面に反映する。
   */
  const refreshInquiry = async (targetInquiryId: string) => {
    const requestId = ++refreshRequestIdRef.current;

    const response = await getInquiry(targetInquiryId);

    if (requestId !== refreshRequestIdRef.current) {
      return;
    }

    applyInquiry(response);
  };

  /**
   * 初回取得。
   *
   * 問い合わせ詳細とログインユーザー情報を取得する。
   * 古いリクエストの結果が反映されないよう制御する。
   */
  useEffect(() => {
    if (!inquiryId) {
      return;
    }

    let cancelled = false;

    const requestId = ++refreshRequestIdRef.current;

    const loadInquiry = async () => {
      try {
        const [inquiryResponse, userResponse] = await Promise.all([
          getInquiry(inquiryId),
          getMe(),
        ]);

        if (cancelled || requestId !== refreshRequestIdRef.current) {
          return;
        }

        applyInquiry(inquiryResponse);
        setCurrentUser(userResponse);
        setError(null);
      } catch (error) {
        if (cancelled || requestId !== refreshRequestIdRef.current) {
          return;
        }

        console.error("問い合わせ詳細の初期取得に失敗しました。", error);

        setError("問い合わせ詳細の取得に失敗しました。");
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    };

    void loadInquiry();

    return () => {
      cancelled = true;
      refreshRequestIdRef.current += 1;
    };
  }, [inquiryId]);

  /**
   * 返信送信。
   */

  const handleSendMessage = async () => {
    if (!inquiryId || isSending || isUpdatingStatus) {
      return;
    }

    const body = messageBody.trim();

    if (body === "") {
      setError("メッセージを入力してください。");
      return;
    }

    setIsSending(true);
    setError(null);

    try {
      await addInquiryMessage(inquiryId, { body });
    } catch (error) {
      console.error("メッセージ送信に失敗しました。", error);
      setError("メッセージ送信に失敗しました。");
      setIsSending(false);
      return;
    }

    setMessageBody("");

    try {
      await refreshInquiry(inquiryId);
    } catch (error) {
      console.error("送信後の再取得に失敗しました。", error);
      setError(
        "メッセージは送信されましたが、履歴の更新に失敗しました。画面を再読み込みしてください。",
      );
    } finally {
      setIsSending(false);
    }
  };

  /**
   * ステータス更新。
   */
  const handleUpdateStatus = async () => {
    if (!inquiryId || isUpdatingStatus || isSending || !inquiry) {
      return;
    }

    if (status === inquiry.status) {
      return;
    }

    setIsUpdatingStatus(true);
    setError(null);

    try {
      await updateInquiryStatus(inquiryId, { status });
    } catch (error) {
      console.error("ステータス更新に失敗しました。", error);
      setError("ステータス更新に失敗しました。");
      setIsUpdatingStatus(false);
      return;
    }

    setInquiry((previous) => (previous ? { ...previous, status } : previous));

    try {
      await refreshInquiry(inquiryId);
    } catch (error) {
      console.error("更新後の再取得に失敗しました。", error);
      setError(
        "ステータスは更新されましたが、最新情報の取得に失敗しました。画面を再読み込みしてください。",
      );
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

              <InquiryStatusChip status={inquiry.status} />
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
                {currentUser !== null && (
                  <InquiryStatusForm
                    status={status}
                    currentStatus={inquiry.status}
                    role={currentUser.role}
                    onStatusChange={setStatus}
                    onUpdateStatus={() => {
                      void handleUpdateStatus();
                    }}
                    isUpdatingStatus={isUpdatingStatus || isSending}
                  />
                )}
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

              <InquiryMessageList
                messages={inquiry.messages}
                currentUser={currentUser}
              />
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

              <InquiryMessageForm
                messageBody={messageBody}
                onMessageBodyChange={setMessageBody}
                onSendMessage={() => {
                  void handleSendMessage();
                }}
                isSending={isSending || isUpdatingStatus}
              />
            </CardContent>
          </Card>
        </Stack>
      </Container>
    </Box>
  );
}
