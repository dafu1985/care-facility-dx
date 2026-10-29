import {
  Alert,
  Box,
  Button,
  Card,
  CardActionArea,
  CardContent,
  Chip,
  CircularProgress,
  Container,
  Stack,
  Typography,
} from "@mui/material";
import { useEffect, useMemo, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";

import { getInquiries } from "../api/get-inquiries";
import type {
  InquiryListItem,
  InquiryListResponse,
  InquiryStatus,
} from "../types/inquiry";

/**
 * 問い合わせステータスを日本語表示へ変換する。
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
 * 問い合わせステータスに応じたChip色を返す。
 */
function getStatusColor(
  status: InquiryStatus,
):
  | "default"
  | "primary"
  | "secondary"
  | "error"
  | "info"
  | "success"
  | "warning" {
  switch (status) {
    case "OPEN":
      return "warning";

    case "IN_PROGRESS":
      return "info";

    case "ANSWERED":
      return "success";

    case "CLOSED":
      return "default";

    case "CANCELLED":
      return "error";

    default:
      return "default";
  }
}

/**
 * 日時を日本向けの表示形式へ変換する。
 */
function formatDateTime(dateTime: string | null): string {
  if (!dateTime) {
    return "-";
  }

  const date = new Date(dateTime);

  if (Number.isNaN(date.getTime())) {
    return "日時不明";
  }

  return new Intl.DateTimeFormat("ja-JP", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}

/**
 * URLから問い合わせステータスを取得する。
 *
 * 例:
 * /inquiries?status=OPEN,IN_PROGRESS
 */
function parseStatuses(value: string | null): InquiryStatus[] {
  if (!value) {
    return [];
  }

  const validStatuses: InquiryStatus[] = [
    "OPEN",
    "IN_PROGRESS",
    "ANSWERED",
    "CLOSED",
    "CANCELLED",
  ];

  return value
    .split(",")
    .filter((status): status is InquiryStatus =>
      validStatuses.includes(status as InquiryStatus),
    );
}

/**
 * 現在の絞り込み条件を画面表示用の文言へ変換する。
 */
function getFilterLabel(statuses: InquiryStatus[]): string {
  if (statuses.length === 0) {
    return "すべて";
  }

  if (
    statuses.length === 2 &&
    statuses.includes("OPEN") &&
    statuses.includes("IN_PROGRESS")
  ) {
    return "対応中";
  }

  if (statuses.length === 1) {
    return getStatusLabel(statuses[0]);
  }

  return statuses.map(getStatusLabel).join("・");
}

/**
 * 問い合わせ一覧1件分。
 */
function InquiryCard({ inquiry }: { inquiry: InquiryListItem }) {
  const navigate = useNavigate();

  return (
    <Card
      variant="outlined"
      sx={{
        borderRadius: 3,
        borderColor: "divider",
        bgcolor: "background.paper",
        boxShadow: "0 4px 16px rgba(99, 102, 241, 0.04)",
        overflow: "hidden",
        transition: "transform 0.2s ease, box-shadow 0.2s ease",
        "&:hover": {
          transform: "translateY(-2px)",
          boxShadow: "0 8px 24px rgba(99, 102, 241, 0.12)",
          borderColor: "#C7D2FE",
        },
      }}
    >
      <CardActionArea
        onClick={() => {
          navigate(`/inquiries/${inquiry.inquiryId}`);
        }}
        sx={{
          height: "100%",
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
          <Stack spacing={1.5}>
            {/* 件名・ステータス */}
            <Box
              sx={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "flex-start",
                flexWrap: "wrap",
                gap: 1.5,
              }}
            >
              <Box sx={{ minWidth: 0, flex: 1 }}>
                <Typography
                  variant="caption"
                  sx={{
                    color: "primary.main",
                    fontWeight: 800,
                    letterSpacing: 0.5,
                  }}
                >
                  💬 INQUIRY
                </Typography>

                <Typography
                  variant="h6"
                  component="h2"
                  sx={{
                    fontWeight: 800,
                    fontSize: { xs: "1rem", sm: "1.15rem" },
                    lineHeight: 1.6,
                    mt: 0.5,
                    overflowWrap: "anywhere",
                  }}
                >
                  {inquiry.subject}
                </Typography>
              </Box>

              <Chip
                label={getStatusLabel(inquiry.status)}
                color={getStatusColor(inquiry.status)}
                size="small"
                sx={{
                  fontWeight: 800,
                  borderRadius: 2,
                  flexShrink: 0,
                  px: 0.5,
                }}
              />
            </Box>

            {/* 問い合わせ先施設・最終更新 */}
            <Box
              sx={{
                display: "grid",
                gridTemplateColumns: {
                  xs: "1fr",
                  sm: "repeat(2, minmax(0, 1fr))",
                },
                gap: 1.5,
                mt: 1,
              }}
            >
              {/* 問い合わせ先施設 */}
              <Box
                sx={{
                  p: 2,
                  borderRadius: 2.5,
                  bgcolor: "#F8FAFC",
                  minWidth: 0,
                }}
              >
                <Typography
                  variant="caption"
                  sx={{
                    color: "text.secondary",
                    fontWeight: 700,
                  }}
                >
                  🏡 問い合わせ先施設
                </Typography>

                <Typography
                  variant="body2"
                  sx={{
                    mt: 0.5,
                    fontWeight: 700,
                    overflowWrap: "anywhere",
                  }}
                >
                  {inquiry.facilityName}
                </Typography>
              </Box>

              {/* 最終更新日時 */}
              <Box
                sx={{
                  p: 2,
                  borderRadius: 2.5,
                  bgcolor: "#F8FAFC",
                  minWidth: 0,
                }}
              >
                <Typography
                  variant="caption"
                  sx={{
                    color: "text.secondary",
                    fontWeight: 700,
                  }}
                >
                  🕒 最終更新
                </Typography>

                <Typography
                  variant="body2"
                  sx={{
                    mt: 0.5,
                    fontWeight: 700,
                  }}
                >
                  {formatDateTime(inquiry.lastMessageAt ?? inquiry.updatedAt)}
                </Typography>
              </Box>
            </Box>
          </Stack>
        </CardContent>
      </CardActionArea>
    </Card>
  );
}

/**
 * 問い合わせ一覧画面。
 *
 * CARE_MANAGER:
 * 自分が作成した問い合わせのみ。
 *
 * FACILITY:
 * Backend側で自施設宛の問い合わせだけに
 * 絞り込まれる。
 *
 * ADMIN:
 * 権限に応じて問い合わせ一覧を取得する。
 */
export function InquiryListPage() {
  /**
   * 画面遷移用。
   */
  const navigate = useNavigate();

  /**
   * URLクエリパラメータ。
   */
  const [searchParams] = useSearchParams();

  const [response, setResponse] = useState<InquiryListResponse | null>(null);

  const [isLoading, setIsLoading] = useState(true);

  const [error, setError] = useState<string | null>(null);

  /**
   * URLのstatusパラメータから
   * 絞り込み対象ステータスを取得する。
   */
  const selectedStatuses = useMemo(
    () => parseStatuses(searchParams.get("status")),
    [searchParams],
  );

  /**
   * APIから取得した問い合わせを
   * URLクエリに応じて画面側で絞り込む。
   */
  const filteredItems = useMemo(() => {
    if (!response) {
      return [];
    }

    if (selectedStatuses.length === 0) {
      return response.items;
    }

    return response.items.filter((inquiry) =>
      selectedStatuses.includes(inquiry.status),
    );
  }, [response, selectedStatuses]);

  /**
   * 問い合わせ一覧を取得する。
   */
  useEffect(() => {
    let cancelled = false;

    getInquiries()
      .then((result) => {
        if (cancelled) {
          return;
        }

        setResponse(result);
        setError(null);
      })
      .catch((error) => {
        if (cancelled) {
          return;
        }

        console.error("問い合わせ一覧の取得に失敗しました。", error);

        setError("問い合わせ一覧の取得に失敗しました。");
      })
      .finally(() => {
        if (cancelled) {
          return;
        }

        setIsLoading(false);
      });

    /**
     * コンポーネント破棄後に
     * state更新を行わないようにする。
     */
    return () => {
      cancelled = true;
    };
  }, []);

  /**
   * 読み込み中。
   */
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

  /**
   * API取得失敗。
   */
  if (error) {
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

  /**
   * 問い合わせ情報が存在しない場合。
   */
  if (!response) {
    return (
      <Container
        maxWidth="md"
        sx={{
          py: 4,
        }}
      >
        <Alert severity="warning">問い合わせ情報を取得できませんでした。</Alert>
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
        {/* 画面ヘッダー */}
        <Box>
          {/* ホームへ戻る */}
          <Button
            variant="text"
            onClick={() => {
              navigate("/");
            }}
            sx={{
              mb: 2,
            }}
          >
            ← ホームへ戻る
          </Button>

          <Box sx={{ mb: 2 }}>
            <Typography
              variant="overline"
              sx={{
                color: "primary.main",
                fontWeight: 800,
                letterSpacing: 1.5,
              }}
            >
              INQUIRY MANAGEMENT
            </Typography>

            <Typography
              variant="h4"
              component="h1"
              sx={{
                fontWeight: 800,
                fontSize: { xs: "1.5rem", sm: "2rem" },
                mt: 0.5,
                mb: 1,
              }}
            >
              💬 問い合わせ一覧
            </Typography>

            <Typography
              variant="body2"
              color="text.secondary"
              sx={{
                lineHeight: 1.8,
              }}
            >
              施設への問い合わせ状況や回答内容を確認できます。
            </Typography>
          </Box>

          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              flexWrap: "wrap",
              gap: 2,
              p: { xs: 2, sm: 2.5 },
              bgcolor: "#F8FAFC",
              border: "1px solid",
              borderColor: "divider",
              borderRadius: 3,
            }}
          >
            <Stack
              direction="row"
              sx={{
                alignItems: "center",
                flexWrap: "wrap",
                gap: 1.5,
              }}
            >
              <Box
                sx={{
                  display: "flex",
                  alignItems: "baseline",
                  gap: 0.5,
                }}
              >
                <Typography
                  variant="h5"
                  sx={{
                    fontWeight: 800,
                    color: "primary.main",
                  }}
                >
                  {filteredItems.length}
                </Typography>

                <Typography
                  variant="body2"
                  sx={{ color: "text.secondary", fontWeight: 600 }}
                >
                  件の問い合わせ
                </Typography>
              </Box>

              <Chip
                label={`表示：${getFilterLabel(selectedStatuses)}`}
                size="small"
                variant="outlined"
                sx={{
                  borderRadius: 2,
                  fontWeight: 700,
                  bgcolor: "background.paper",
                }}
              />
            </Stack>

            {selectedStatuses.length > 0 && (
              <Button
                size="small"
                variant="outlined"
                onClick={() => {
                  navigate("/inquiries");
                }}
                sx={{
                  borderRadius: 2,
                  fontWeight: 700,
                  textTransform: "none",
                }}
              >
                絞り込み解除
              </Button>
            )}
          </Box>
        </Box>

        {/* 問い合わせ一覧 */}
        {filteredItems.length === 0 ? (
          <Alert severity="info">条件に一致する問い合わせはありません。</Alert>
        ) : (
          <Stack spacing={2}>
            {filteredItems.map((inquiry) => (
              <InquiryCard key={inquiry.inquiryId} inquiry={inquiry} />
            ))}
          </Stack>
        )}
      </Stack>
    </Container>
  );
}
