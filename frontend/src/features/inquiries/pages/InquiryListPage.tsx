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
    <Card variant="outlined">
      <CardActionArea
        onClick={() => {
          navigate(`/inquiries/${inquiry.inquiryId}`);
        }}
      >
        <CardContent>
          <Stack spacing={1.5}>
            {/* 件名・ステータス */}
            <Box
              sx={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                gap: 2,
              }}
            >
              <Typography
                variant="h6"
                component="h2"
                sx={{
                  fontWeight: 700,
                }}
              >
                {inquiry.subject}
              </Typography>

              <Chip
                label={getStatusLabel(inquiry.status)}
                color={getStatusColor(inquiry.status)}
                size="small"
              />
            </Box>

            {/* 問い合わせ先施設 */}
            <Typography variant="body2" color="text.secondary">
              問い合わせ先：
              {inquiry.facilityName}
            </Typography>

            {/* 最終更新 */}
            <Typography variant="body2" color="text.secondary">
              最終更新：
              {formatDateTime(inquiry.lastMessageAt ?? inquiry.updatedAt)}
            </Typography>
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

          <Typography variant="h4" component="h1" gutterBottom>
            問い合わせ一覧
          </Typography>

          <Stack
            direction="row"
            sx={{
              alignItems: "center",
              flexWrap: "wrap",
              gap: 1,
            }}
          >
            <Typography color="text.secondary">
              {filteredItems.length}件
            </Typography>

            <Chip
              label={`表示：${getFilterLabel(selectedStatuses)}`}
              size="small"
              variant="outlined"
            />

            {selectedStatuses.length > 0 && (
              <Button
                size="small"
                onClick={() => {
                  navigate("/inquiries");
                }}
              >
                絞り込み解除
              </Button>
            )}
          </Stack>
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
