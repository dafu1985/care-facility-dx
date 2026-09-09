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
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

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
 * 日時を日本向けの表示形式へ変換する。
 */
function formatDateTime(dateTime: string | null): string {
  if (!dateTime) {
    return "-";
  }

  const date = new Date(dateTime);

  return date.toLocaleString("ja-JP");
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

              <Chip label={getStatusLabel(inquiry.status)} size="small" />
            </Box>

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
 * FACILITYユーザーの場合、
 * Backend側で自施設の問い合わせだけに
 * 絞り込まれる。
 */
export function InquiryListPage() {
  /**
   * 画面遷移用。
   */
  const navigate = useNavigate();

  const [response, setResponse] = useState<InquiryListResponse | null>(null);

  const [isLoading, setIsLoading] = useState(true);

  const [error, setError] = useState<string | null>(null);

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
          {/* 施設ダッシュボードへ戻る */}
          <Button
            variant="text"
            onClick={() => {
              navigate("/");
            }}
            sx={{
              mb: 2,
            }}
          >
            ← ダッシュボードへ戻る
          </Button>

          <Typography variant="h4" component="h1" gutterBottom>
            問い合わせ一覧
          </Typography>

          <Typography color="text.secondary">全{response.total}件</Typography>
        </Box>

        {/* 問い合わせ一覧 */}
        {response.items.length === 0 ? (
          <Alert severity="info">問い合わせはありません。</Alert>
        ) : (
          <Stack spacing={2}>
            {response.items.map((inquiry) => (
              <InquiryCard key={inquiry.inquiryId} inquiry={inquiry} />
            ))}
          </Stack>
        )}
      </Stack>
    </Container>
  );
}
