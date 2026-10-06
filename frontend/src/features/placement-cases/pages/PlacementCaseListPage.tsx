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
function getPlacementCaseStatusLabel(status: PlacementCaseStatus): string {
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
 * 緊急度を画面表示用の日本語へ変換する。
 */
function getUrgencyLabel(urgency: string | null): string {
  switch (urgency) {
    case "HIGH":
      return "高";

    case "MEDIUM":
      return "中";

    case "LOW":
      return "低";

    default:
      return urgency ?? "未設定";
  }
}

/**
 * 緊急度に応じたChipの色を返す。
 */
function getUrgencyColor(
  urgency: string | null,
): "default" | "error" | "warning" | "success" {
  switch (urgency) {
    case "HIGH":
      return "error";

    case "MEDIUM":
      return "warning";

    case "LOW":
      return "success";

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
  const [placementCases, setPlacementCases] = useState<PlacementCase[]>([]);

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

        console.error("施設探し案件一覧の取得に失敗しました。", error);

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
          minHeight: "50vh",
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
        maxWidth="xl"
        sx={{
          py: {
            xs: 3,
            md: 4,
          },
        }}
      >
        <Alert severity="error">{error}</Alert>
      </Container>
    );
  }

  return (
    <Container
      maxWidth="xl"
      sx={{
        py: {
          xs: 3,
          md: 4,
        },
      }}
    >
      <Stack spacing={3}>
        {/* ページヘッダー */}
        <Box
          sx={{
            position: "relative",
            overflow: "hidden",
            borderRadius: 4,
            px: {
              xs: 3,
              md: 4,
            },
            py: {
              xs: 3,
              md: 4,
            },
            background:
              "linear-gradient(135deg, #EEF2FF 0%, #FFF1EC 55%, #E8F7F5 100%)",
          }}
        >
          {/* 装飾 */}
          <Box
            sx={{
              position: "absolute",
              width: 180,
              height: 180,
              borderRadius: "50%",
              bgcolor: "rgba(255,255,255,0.45)",
              top: -90,
              right: -40,
            }}
          />

          <Box
            sx={{
              position: "relative",
              zIndex: 1,
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
              gap: 3,
            }}
          >
            <Stack spacing={1}>
              <Typography
                variant="overline"
                sx={{
                  color: "primary.main",
                  fontWeight: 800,
                  letterSpacing: "0.12em",
                }}
              >
                PLACEMENT CASES
              </Typography>

              <Typography
                variant="h4"
                component="h1"
                sx={{
                  display: "flex",
                  alignItems: "center",
                  gap: 1,
                }}
              >
                <Box component="span">📋</Box>
                施設探し案件
              </Typography>

              <Typography
                color="text.secondary"
                sx={{
                  maxWidth: 560,
                }}
              >
                利用者の施設探し案件をまとめて管理できます。
              </Typography>
            </Stack>

            <Button
              variant="contained"
              size="large"
              onClick={() => {
                navigate("/placement-cases/new");
              }}
              sx={{
                flexShrink: 0,
                minHeight: 48,
                px: 3,
              }}
            >
              ＋ 新規案件を作成
            </Button>
          </Box>
        </Box>

        {/* 件数 */}
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            gap: 1,
          }}
        >
          <Box
            sx={{
              width: 36,
              height: 36,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              borderRadius: 2,
              bgcolor: "primary.light",
              fontSize: "1.1rem",
            }}
          >
            📂
          </Box>

          <Typography
            sx={{
              fontWeight: 700,
              color: "text.primary",
            }}
          >
            {placementCases.length}件の案件
          </Typography>
        </Box>

        {/* 案件一覧 */}
        {placementCases.length === 0 ? (
          <Card>
            <CardContent
              sx={{
                p: {
                  xs: 3,
                  md: 5,
                },
                textAlign: "center",
              }}
            >
              <Stack
                spacing={2}
                sx={{
                  alignItems: "center",
                }}
              >
                <Box
                  sx={{
                    width: 72,
                    height: 72,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    borderRadius: "50%",
                    bgcolor: "primary.light",
                    fontSize: "2rem",
                  }}
                >
                  📋
                </Box>

                <Typography variant="h6">まだ案件がありません</Typography>

                <Typography
                  color="text.secondary"
                  sx={{
                    maxWidth: 440,
                  }}
                >
                  施設探し案件を作成すると、
                  利用者条件や候補施設をここから管理できます。
                </Typography>

                <Button
                  variant="contained"
                  onClick={() => {
                    navigate("/placement-cases/new");
                  }}
                >
                  ＋ 最初の案件を作成する
                </Button>
              </Stack>
            </CardContent>
          </Card>
        ) : (
          <Stack spacing={2}>
            {placementCases.map((placementCase) => (
              <Card
                key={placementCase.placementCaseId}
                sx={{
                  transition:
                    "transform 0.18s ease, box-shadow 0.18s ease, border-color 0.18s ease",
                  "&:hover": {
                    transform: "translateY(-2px)",
                    borderColor: "primary.main",
                    boxShadow: "0 10px 30px rgba(79, 70, 229, 0.12)",
                  },
                }}
              >
                <CardActionArea
                  onClick={() => {
                    navigate(
                      `/placement-cases/${placementCase.placementCaseId}`,
                    );
                  }}
                  sx={{
                    borderRadius: 5,
                  }}
                >
                  <CardContent
                    sx={{
                      p: {
                        xs: 2.5,
                        md: 3,
                      },
                      "&:last-child": {
                        pb: {
                          xs: 2.5,
                          md: 3,
                        },
                      },
                    }}
                  >
                    <Stack spacing={2.5}>
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
                          gap: 1.5,
                        }}
                      >
                        <Stack
                          spacing={1.5}
                          sx={{
                            alignItems: "center",
                          }}
                        >
                          <Box
                            sx={{
                              width: 44,
                              height: 44,
                              flexShrink: 0,
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              borderRadius: 3,
                              bgcolor: "primary.light",
                              fontSize: "1.25rem",
                            }}
                          >
                            📋
                          </Box>

                          <Box>
                            <Typography
                              variant="caption"
                              color="text.secondary"
                            >
                              案件コード
                            </Typography>

                            <Typography
                              variant="h6"
                              component="h2"
                              sx={{
                                lineHeight: 1.3,
                              }}
                            >
                              {placementCase.caseCode}
                            </Typography>
                          </Box>
                        </Stack>

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

                      {/* 案件情報 */}
                      <Box
                        sx={{
                          display: "grid",
                          gridTemplateColumns: {
                            xs: "1fr",
                            sm: "repeat(2, minmax(0, 1fr))",
                          },
                          gap: 1.5,
                        }}
                      >
                        {/* 入居希望日 */}
                        <Box
                          sx={{
                            display: "flex",
                            alignItems: "center",
                            gap: 1.5,
                            p: 1.75,
                            borderRadius: 3,
                            bgcolor: "background.default",
                          }}
                        >
                          <Box
                            sx={{
                              fontSize: "1.2rem",
                            }}
                          >
                            📅
                          </Box>

                          <Box>
                            <Typography
                              variant="caption"
                              color="text.secondary"
                            >
                              入居希望日
                            </Typography>

                            <Typography
                              variant="body2"
                              sx={{
                                fontWeight: 700,
                              }}
                            >
                              {formatDate(placementCase.desiredMoveInDate)}
                            </Typography>
                          </Box>
                        </Box>

                        {/* 緊急度 */}
                        <Box
                          sx={{
                            display: "flex",
                            alignItems: "center",
                            gap: 1.5,
                            p: 1.75,
                            borderRadius: 3,
                            bgcolor: "background.default",
                          }}
                        >
                          <Box
                            sx={{
                              fontSize: "1.2rem",
                            }}
                          >
                            ⚡
                          </Box>

                          <Box>
                            <Typography
                              variant="caption"
                              color="text.secondary"
                            >
                              緊急度
                            </Typography>

                            <Box sx={{ mt: 0.25 }}>
                              <Chip
                                label={getUrgencyLabel(placementCase.urgency)}
                                color={getUrgencyColor(placementCase.urgency)}
                                size="small"
                                variant="outlined"
                              />
                            </Box>
                          </Box>
                        </Box>
                      </Box>

                      {/* メモ */}
                      {placementCase.note && (
                        <Box
                          sx={{
                            px: 2,
                            py: 1.5,
                            borderRadius: 3,
                            bgcolor: "secondary.light",
                          }}
                        >
                          <Typography
                            variant="caption"
                            color="text.secondary"
                            sx={{
                              display: "block",
                              mb: 0.5,
                            }}
                          >
                            📝 メモ
                          </Typography>

                          <Typography variant="body2">
                            {placementCase.note}
                          </Typography>
                        </Box>
                      )}

                      {/* フッター */}
                      <Box
                        sx={{
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "center",
                          gap: 2,
                          pt: 0.5,
                        }}
                      >
                        <Typography variant="caption" color="text.secondary">
                          最終更新：
                          {formatDate(placementCase.updatedAt)}
                        </Typography>

                        <Typography
                          variant="body2"
                          sx={{
                            color: "primary.main",
                            fontWeight: 700,
                            whiteSpace: "nowrap",
                          }}
                        >
                          詳細を見る ›
                        </Typography>
                      </Box>
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
