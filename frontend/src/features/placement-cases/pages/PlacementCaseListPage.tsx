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

import { getPlacementCases } from "../api/get-placement-cases";

import type {
  PlacementCase,
  PlacementCaseStatus,
} from "../types/placement-case";

/**
 * 案件ステータスを画面表示用の日本語へ変換する。
 */
function getPlacementCaseStatusLabel(
  status: PlacementCaseStatus,
): string {
  switch (status) {
    case "SEARCHING":
      return "施設を検索中";

    case "INQUIRING":
      return "問い合わせ中";

    case "VISITING":
      return "見学中";

    case "APPLYING":
      return "入居申込中";

    case "COMPLETED":
      return "完了";

    case "CANCELLED":
      return "キャンセル";

    default:
      return status;
  }
}

/**
 * 案件ステータスに応じたChipの色を返す。
 */
function getPlacementCaseStatusColor(
  status: PlacementCaseStatus,
):
  | "default"
  | "primary"
  | "secondary"
  | "error"
  | "info"
  | "success"
  | "warning" {
  switch (status) {
    case "SEARCHING":
      return "primary";

    case "INQUIRING":
      return "warning";

    case "VISITING":
      return "info";

    case "APPLYING":
      return "secondary";

    case "COMPLETED":
      return "success";

    case "CANCELLED":
      return "error";

    default:
      return "default";
  }
}

/**
 * 日付を日本語表示用に整形する。
 *
 * @param value YYYY-MM-DD またはISO形式の日付
 */
function formatDate(value: string | null): string {
  if (!value) {
    return "未設定";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "日付不明";
  }

  return new Intl.DateTimeFormat("ja-JP", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(date);
}

/**
 * 施設探し案件一覧画面。
 */
export function PlacementCaseListPage() {
  const navigate = useNavigate();

  /**
   * 案件一覧。
   */
  const [placementCases, setPlacementCases] = useState<PlacementCase[]>(
    [],
  );

  /**
   * API読み込み状態。
   */
  const [isLoading, setIsLoading] = useState(true);

  /**
   * APIエラー。
   */
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    getPlacementCases()
      .then((response) => {
        if (cancelled) {
          return;
        }

        setPlacementCases(response);
        setError(null);
      })
      .catch((error) => {
        if (cancelled) {
          return;
        }

        console.error(
          "施設探し案件一覧の取得に失敗しました。",
          error,
        );

        setError(
          "施設探し案件一覧の取得に失敗しました。時間をおいて再度お試しください。",
        );
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
   * APIエラー。
   */
  if (error) {
    return (
      <Container
        maxWidth="lg"
        sx={{
          py: 4,
        }}
      >
        <Alert severity="error">{error}</Alert>
      </Container>
    );
  }

  return (
    <Container
      maxWidth="lg"
      sx={{
        py: 4,
      }}
    >
      <Stack spacing={3}>
        {/* ヘッダー */}
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: {
              xs: "flex-start",
              sm: "center",
            },
            flexDirection: {
              xs: "column",
              sm: "row",
            },
            gap: 2,
          }}
        >
          <Box>
            <Typography variant="h5" component="h1">
              施設探し案件
            </Typography>

            <Typography
              variant="body2"
              color="text.secondary"
              sx={{
                mt: 0.5,
              }}
            >
              利用者の施設探し案件を管理します。
            </Typography>
          </Box>

          <Button
            variant="contained"
            onClick={() => {
              navigate("/placement-cases/new");
            }}
          >
            新規案件を作成
          </Button>
        </Box>

        {/* 案件件数 */}
        <Typography color="text.secondary">
          {placementCases.length}件の案件があります。
        </Typography>

        {/* 案件一覧 */}
        {placementCases.length === 0 ? (
          <Card>
            <CardContent>
              <Stack spacing={2}>
                <Typography variant="h6">
                  案件がありません
                </Typography>

                <Typography color="text.secondary">
                  施設探し案件を作成すると、ここに表示されます。
                </Typography>

                <Box>
                  <Button
                    variant="contained"
                    onClick={() => {
                      navigate("/placement-cases/new");
                    }}
                  >
                    最初の案件を作成する
                  </Button>
                </Box>
              </Stack>
            </CardContent>
          </Card>
        ) : (
          <Stack spacing={2}>
            {placementCases.map((placementCase) => (
              <Card key={placementCase.placementCaseId}>
                <CardActionArea
                  onClick={() => {
                    navigate(
                      `/placement-cases/${placementCase.placementCaseId}`,
                    );
                  }}
                >
                  <CardContent>
                    <Stack spacing={1.5}>
                      {/* 案件コード・ステータス */}
                      <Box
                        sx={{
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: {
                            xs: "flex-start",
                            sm: "center",
                          },
                          flexDirection: {
                            xs: "column",
                            sm: "row",
                          },
                          gap: 1,
                        }}
                      >
                        <Typography
                          variant="h6"
                          component="h2"
                        >
                          {placementCase.caseCode}
                        </Typography>

                        <Chip
                          label={getPlacementCaseStatusLabel(
                            placementCase.status,
                          )}
                          color={getPlacementCaseStatusColor(
                            placementCase.status,
                          )}
                          size="small"
                        />
                      </Box>

                      {/* 入居希望日 */}
                      <Typography variant="body2">
                        入居希望日：
                        {formatDate(
                          placementCase.desiredMoveInDate,
                        )}
                      </Typography>

                      {/* 緊急度 */}
                      <Typography variant="body2">
                        緊急度：
                        {placementCase.urgency ?? "未設定"}
                      </Typography>

                      {/* メモ */}
                      {placementCase.note && (
                        <Typography
                          variant="body2"
                          color="text.secondary"
                        >
                          {placementCase.note}
                        </Typography>
                      )}

                      {/* 更新日時 */}
                      <Typography
                        variant="caption"
                        color="text.secondary"
                      >
                        最終更新：
                        {formatDate(placementCase.updatedAt)}
                      </Typography>
                    </Stack>
                  </CardContent>
                </CardActionArea>
              </Card>
            ))}
          </Stack>
        )}
      </Stack>
    </Container>
  );
}
