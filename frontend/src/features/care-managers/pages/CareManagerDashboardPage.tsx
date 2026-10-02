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

import { getCareManagerDashboard } from "../api/get-care-manager-dashboard";

import type { CareManagerDashboardResponse } from "../types/care-manager-dashboard";

/**
 * 問い合わせステータスを画面表示用の日本語へ変換する。
 */
function getInquiryStatusLabel(status: string): string {
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
 * 問い合わせステータスに応じたChipの色を返す。
 */
function getInquiryStatusColor(
  status: string,
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
 * ISO形式の日時を日本向けの表示へ変換する。
 *
 * @param value ISO形式の日時文字列
 * @returns 日本向けに整形した日時
 */
function formatDateTime(value: string | null): string {
  if (!value) {
    return "未更新";
  }

  const date = new Date(value);

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
 * ケアマネジャー向けダッシュボード画面。
 *
 * ケアマネジャー情報、
 * 問い合わせ状況、
 * 最近の問い合わせ、
 * 施設探し案件、
 * 施設検索への導線を表示する。
 */
export function CareManagerDashboardPage() {
  /**
   * 画面遷移用。
   */
  const navigate = useNavigate();

  /**
   * ダッシュボード情報。
   */
  const [dashboard, setDashboard] =
    useState<CareManagerDashboardResponse | null>(null);

  /**
   * 読み込み状態。
   */
  const [isLoading, setIsLoading] = useState(true);

  /**
   * APIエラー。
   */
  const [error, setError] = useState<string | null>(null);

  /**
   * 初回表示時に
   * ケアマネジャーダッシュボード情報を取得する。
   */
  useEffect(() => {
    let cancelled = false;

    getCareManagerDashboard()
      .then((response) => {
        if (cancelled) {
          return;
        }

        setDashboard(response);
        setError(null);
      })
      .catch((error) => {
        if (cancelled) {
          return;
        }

        console.error(
          "ケアマネジャーダッシュボードの取得に失敗しました。",
          error,
        );

        setError("ケアマネジャーダッシュボードの取得に失敗しました。");
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
        maxWidth="lg"
        sx={{
          py: 4,
        }}
      >
        <Alert severity="error">{error}</Alert>
      </Container>
    );
  }

  /**
   * ダッシュボード情報が存在しない場合。
   */
  if (!dashboard) {
    return (
      <Container
        maxWidth="lg"
        sx={{
          py: 4,
        }}
      >
        <Alert severity="warning">
          ケアマネジャー情報を取得できませんでした。
        </Alert>
      </Container>
    );
  }

  const { careManager, inquirySummary } = dashboard;

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
        {/* ウェルカムエリア */}
        <Box
          sx={{
            position: "relative",
            overflow: "hidden",
            px: {
              xs: 3,
              md: 4,
            },
            py: {
              xs: 3,
              md: 4,
            },
            borderRadius: 5,
            background:
              "linear-gradient(135deg, #EEF2FF 0%, #FFF1EC 55%, #E8F7F5 100%)",
          }}
        >
          {/* 背景装飾 */}
          <Box
            sx={{
              position: "absolute",
              top: -40,
              right: -20,
              width: 150,
              height: 150,
              borderRadius: "50%",
              bgcolor: "rgba(255, 255, 255, 0.55)",
            }}
          />

          <Box
            sx={{
              position: "relative",
              zIndex: 1,
            }}
          >
            <Typography
              variant="body2"
              sx={{
                mb: 1,
                fontWeight: 700,
                color: "primary.main",
              }}
            >
              CARE MANAGER
            </Typography>

            <Typography
              variant="h4"
              component="h1"
              sx={{
                mb: 1,
              }}
            >
              おつかれさまです 👋
            </Typography>

            <Typography
              color="text.secondary"
              sx={{
                maxWidth: 600,
              }}
            >
              施設探しや問い合わせ状況をここからまとめて確認できます。
              今日の業務もスムーズに進めていきましょう。
            </Typography>
          </Box>
        </Box>

        {/* 基本情報・施設探し案件 */}
        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: {
              xs: "1fr",
              md: "1fr 1fr",
            },
            gap: 3,
          }}
        >
          {/* ケアマネジャー基本情報 */}
          <Card
            sx={{
              height: "100%",
            }}
          >
            <CardContent
              sx={{
                height: "100%",
                p: {
                  xs: 3,
                  md: 3.5,
                },
              }}
            >
              <Stack spacing={2}>
                <Box
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    gap: 1.5,
                  }}
                >
                  <Box
                    sx={{
                      width: 44,
                      height: 44,
                      display: "grid",
                      placeItems: "center",
                      borderRadius: 3,
                      bgcolor: "primary.light",
                      fontSize: 22,
                    }}
                  >
                    👤
                  </Box>

                  <Typography variant="h6">ケアマネジャー情報</Typography>
                </Box>

                <Stack spacing={1}>
                  <Typography>
                    所属事業所：
                    {careManager.organizationName}
                  </Typography>

                  <Typography>
                    資格番号：
                    {careManager.licenseNumber ?? "未登録"}
                  </Typography>
                </Stack>
              </Stack>
            </CardContent>
          </Card>

          {/* 施設探し案件 */}
          <Card
            sx={{
              height: "100%",
            }}
          >
            <CardContent
              sx={{
                height: "100%",
                p: {
                  xs: 3,
                  md: 3.5,
                },
              }}
            >
              <Stack
                spacing={2}
                sx={{
                  height: "100%",
                }}
              >
                <Box
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    gap: 1.5,
                  }}
                >
                  <Box
                    sx={{
                      width: 44,
                      height: 44,
                      display: "grid",
                      placeItems: "center",
                      borderRadius: 3,
                      bgcolor: "secondary.light",
                      fontSize: 22,
                    }}
                  >
                    📋
                  </Box>

                  <Typography variant="h6">施設探し案件</Typography>
                </Box>

                <Typography color="text.secondary">
                  利用者ごとの入居条件を管理し、条件に合う施設を検索します。
                </Typography>

                <Box
                  sx={{
                    mt: "auto !important",
                  }}
                >
                  <Button
                    variant="contained"
                    onClick={() => {
                      navigate("/placement-cases");
                    }}
                  >
                    施設探し案件を見る
                  </Button>
                </Box>
              </Stack>
            </CardContent>
          </Card>
        </Box>

        {/* 問い合わせサマリー */}
        <Card>
          <CardContent
            sx={{
              p: {
                xs: 3,
                md: 3.5,
              },
            }}
          >
            {/* セクションタイトル */}
            <Box
              sx={{
                mb: 2.5,
              }}
            >
              <Typography variant="h6">問い合わせ状況</Typography>

              <Typography
                variant="body2"
                color="text.secondary"
                sx={{
                  mt: 0.5,
                }}
              >
                現在の問い合わせ状況を確認できます。
              </Typography>
            </Box>

            <Box
              sx={{
                display: "grid",
                gridTemplateColumns: {
                  xs: "1fr",
                  sm: "repeat(2, 1fr)",
                  md: "repeat(4, 1fr)",
                },
                gap: 2,
              }}
            >
              {/* 全問い合わせ */}
              <Card
                elevation={0}
                sx={{
                  height: "100%",
                  bgcolor: "primary.light",
                  border: "1px solid",
                  borderColor: "rgba(99, 102, 241, 0.14)",
                  boxShadow: "none",
                }}
              >
                <CardActionArea
                  onClick={() => {
                    navigate("/inquiries");
                  }}
                  sx={{
                    height: "100%",
                    borderRadius: "inherit",
                  }}
                >
                  <CardContent
                    sx={{
                      p: 2.5,
                    }}
                  >
                    <Stack spacing={2}>
                      {/* タイトル + アイコン */}
                      <Box
                        sx={{
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "space-between",
                          gap: 1,
                        }}
                      >
                        <Typography
                          sx={{
                            fontWeight: 700,
                            color: "primary.dark",
                          }}
                        >
                          全問い合わせ
                        </Typography>

                        <Box
                          sx={{
                            width: 38,
                            height: 38,
                            display: "grid",
                            placeItems: "center",
                            borderRadius: 2.5,
                            bgcolor: "rgba(255, 255, 255, 0.72)",
                            fontSize: 19,
                          }}
                        >
                          💬
                        </Box>
                      </Box>

                      {/* 件数 */}
                      <Box>
                        <Typography
                          component="span"
                          sx={{
                            fontSize: {
                              xs: "2rem",
                              md: "2.25rem",
                            },
                            lineHeight: 1,
                            fontWeight: 800,
                            color: "text.primary",
                          }}
                        >
                          {inquirySummary.totalCount}
                        </Typography>

                        <Typography
                          component="span"
                          sx={{
                            ml: 0.5,
                            fontWeight: 700,
                            color: "text.secondary",
                          }}
                        >
                          件
                        </Typography>
                      </Box>

                      {/* 導線 */}
                      <Typography
                        variant="body2"
                        sx={{
                          fontWeight: 700,
                          color: "primary.dark",
                        }}
                      >
                        すべて確認 →
                      </Typography>
                    </Stack>
                  </CardContent>
                </CardActionArea>
              </Card>

              {/* 未対応 */}
              <Card
                elevation={0}
                sx={{
                  height: "100%",
                  bgcolor: "warning.light",
                  border: "1px solid",
                  borderColor: "rgba(255, 202, 88, 0.35)",
                  boxShadow: "none",
                }}
              >
                <CardActionArea
                  onClick={() => {
                    navigate("/inquiries?status=OPEN");
                  }}
                  sx={{
                    height: "100%",
                    borderRadius: "inherit",
                  }}
                >
                  <CardContent
                    sx={{
                      p: 2.5,
                    }}
                  >
                    <Stack spacing={2}>
                      {/* タイトル + アイコン */}
                      <Box
                        sx={{
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "space-between",
                          gap: 1,
                        }}
                      >
                        <Typography
                          sx={{
                            fontWeight: 700,
                            color: "warning.dark",
                          }}
                        >
                          未対応
                        </Typography>

                        <Box
                          sx={{
                            width: 38,
                            height: 38,
                            display: "grid",
                            placeItems: "center",
                            borderRadius: 2.5,
                            bgcolor: "rgba(255, 255, 255, 0.72)",
                            fontSize: 19,
                          }}
                        >
                          🕐
                        </Box>
                      </Box>

                      {/* 件数 */}
                      <Box>
                        <Typography
                          component="span"
                          sx={{
                            fontSize: {
                              xs: "2rem",
                              md: "2.25rem",
                            },
                            lineHeight: 1,
                            fontWeight: 800,
                            color: "text.primary",
                          }}
                        >
                          {inquirySummary.openCount}
                        </Typography>

                        <Typography
                          component="span"
                          sx={{
                            ml: 0.5,
                            fontWeight: 700,
                            color: "text.secondary",
                          }}
                        >
                          件
                        </Typography>
                      </Box>

                      {/* 導線 */}
                      <Typography
                        variant="body2"
                        sx={{
                          fontWeight: 700,
                          color: "warning.dark",
                        }}
                      >
                        確認する →
                      </Typography>
                    </Stack>
                  </CardContent>
                </CardActionArea>
              </Card>

              {/* 対応中 */}
              <Card
                elevation={0}
                sx={{
                  height: "100%",
                  bgcolor: "info.light",
                  border: "1px solid",
                  borderColor: "rgba(77, 163, 255, 0.22)",
                  boxShadow: "none",
                }}
              >
                <CardActionArea
                  onClick={() => {
                    navigate("/inquiries?status=IN_PROGRESS");
                  }}
                  sx={{
                    height: "100%",
                    borderRadius: "inherit",
                  }}
                >
                  <CardContent
                    sx={{
                      p: 2.5,
                    }}
                  >
                    <Stack spacing={2}>
                      {/* タイトル + アイコン */}
                      <Box
                        sx={{
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "space-between",
                          gap: 1,
                        }}
                      >
                        <Typography
                          sx={{
                            fontWeight: 700,
                            color: "info.dark",
                          }}
                        >
                          対応中
                        </Typography>

                        <Box
                          sx={{
                            width: 38,
                            height: 38,
                            display: "grid",
                            placeItems: "center",
                            borderRadius: 2.5,
                            bgcolor: "rgba(255, 255, 255, 0.72)",
                            fontSize: 19,
                          }}
                        >
                          🔄
                        </Box>
                      </Box>

                      {/* 件数 */}
                      <Box>
                        <Typography
                          component="span"
                          sx={{
                            fontSize: {
                              xs: "2rem",
                              md: "2.25rem",
                            },
                            lineHeight: 1,
                            fontWeight: 800,
                            color: "text.primary",
                          }}
                        >
                          {inquirySummary.inProgressCount}
                        </Typography>

                        <Typography
                          component="span"
                          sx={{
                            ml: 0.5,
                            fontWeight: 700,
                            color: "text.secondary",
                          }}
                        >
                          件
                        </Typography>
                      </Box>

                      {/* 導線 */}
                      <Typography
                        variant="body2"
                        sx={{
                          fontWeight: 700,
                          color: "info.dark",
                        }}
                      >
                        対応を確認 →
                      </Typography>
                    </Stack>
                  </CardContent>
                </CardActionArea>
              </Card>

              {/* 回答済み */}
              <Card
                elevation={0}
                sx={{
                  height: "100%",
                  bgcolor: "success.light",
                  border: "1px solid",
                  borderColor: "rgba(77, 182, 172, 0.25)",
                  boxShadow: "none",
                }}
              >
                <CardActionArea
                  onClick={() => {
                    navigate("/inquiries?status=ANSWERED");
                  }}
                  sx={{
                    height: "100%",
                    borderRadius: "inherit",
                  }}
                >
                  <CardContent
                    sx={{
                      p: 2.5,
                    }}
                  >
                    <Stack spacing={2}>
                      {/* タイトル + アイコン */}
                      <Box
                        sx={{
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "space-between",
                          gap: 1,
                        }}
                      >
                        <Typography
                          sx={{
                            fontWeight: 700,
                            color: "success.dark",
                          }}
                        >
                          回答済み
                        </Typography>

                        <Box
                          sx={{
                            width: 38,
                            height: 38,
                            display: "grid",
                            placeItems: "center",
                            borderRadius: 2.5,
                            bgcolor: "rgba(255, 255, 255, 0.72)",
                            fontSize: 19,
                          }}
                        >
                          ✅
                        </Box>
                      </Box>

                      {/* 件数 */}
                      <Box>
                        <Typography
                          component="span"
                          sx={{
                            fontSize: {
                              xs: "2rem",
                              md: "2.25rem",
                            },
                            lineHeight: 1,
                            fontWeight: 800,
                            color: "text.primary",
                          }}
                        >
                          {inquirySummary.answeredCount}
                        </Typography>

                        <Typography
                          component="span"
                          sx={{
                            ml: 0.5,
                            fontWeight: 700,
                            color: "text.secondary",
                          }}
                        >
                          件
                        </Typography>
                      </Box>

                      {/* 導線 */}
                      <Typography
                        variant="body2"
                        sx={{
                          fontWeight: 700,
                          color: "success.dark",
                        }}
                      >
                        回答を確認 →
                      </Typography>
                    </Stack>
                  </CardContent>
                </CardActionArea>
              </Card>
            </Box>

            <Button
              variant="outlined"
              onClick={() => {
                navigate("/inquiries");
              }}
              sx={{
                mt: 2,
              }}
            >
              問い合わせ一覧を見る
            </Button>
          </CardContent>
        </Card>

        {/* 最近の問い合わせ */}
        <Card>
          <CardContent
            sx={{
              p: {
                xs: 3,
                md: 3.5,
              },
            }}
          >
            <Typography variant="h6" gutterBottom>
              最近の問い合わせ
            </Typography>

            {inquirySummary.recentInquiries.length === 0 ? (
              <Typography color="text.secondary">
                問い合わせはありません。
              </Typography>
            ) : (
              <Stack spacing={2}>
                {inquirySummary.recentInquiries.map((inquiry) => (
                  <Box
                    key={inquiry.inquiryId}
                    role="button"
                    tabIndex={0}
                    onClick={() => {
                      navigate(`/inquiries/${inquiry.inquiryId}`);
                    }}
                    onKeyDown={(event) => {
                      if (event.key === "Enter" || event.key === " ") {
                        event.preventDefault();
                        navigate(`/inquiries/${inquiry.inquiryId}`);
                      }
                    }}
                    sx={{
                      p: {
                        xs: 2,
                        md: 2.5,
                      },
                      border: 1,
                      borderColor: "divider",
                      borderRadius: 3,
                      bgcolor: "background.paper",
                      cursor: "pointer",
                      transition:
                        "background-color 0.2s ease, border-color 0.2s ease, transform 0.2s ease, box-shadow 0.2s ease",

                      "&:hover": {
                        bgcolor: "primary.light",
                        borderColor: "primary.main",
                        transform: "translateY(-2px)",
                        boxShadow: "0 6px 18px rgba(99, 102, 241, 0.10)",
                      },

                      "&:focus-visible": {
                        outline: "2px solid",
                        outlineColor: "primary.main",
                        outlineOffset: 2,
                      },
                    }}
                  >
                    <Box
                      sx={{
                        display: "flex",
                        alignItems: "flex-start",
                        gap: 2,
                      }}
                    >
                      {/* 問い合わせアイコン */}
                      <Box
                        sx={{
                          width: 42,
                          height: 42,
                          flexShrink: 0,
                          display: "grid",
                          placeItems: "center",
                          borderRadius: 3,
                          bgcolor: "primary.light",
                          fontSize: 20,
                        }}
                      >
                        💬
                      </Box>

                      {/* 問い合わせ情報 */}
                      <Box
                        sx={{
                          flexGrow: 1,
                          minWidth: 0,
                        }}
                      >
                        {/* 件名 + ステータス */}
                        <Box
                          sx={{
                            display: "flex",
                            flexDirection: {
                              xs: "column",
                              sm: "row",
                            },
                            alignItems: {
                              xs: "flex-start",
                              sm: "center",
                            },
                            justifyContent: "space-between",
                            gap: 1,
                          }}
                        >
                          <Typography
                            sx={{
                              fontWeight: 700,
                              color: "text.primary",
                            }}
                          >
                            {inquiry.subject}
                          </Typography>

                          <Chip
                            label={getInquiryStatusLabel(inquiry.status)}
                            color={getInquiryStatusColor(inquiry.status)}
                            size="small"
                          />
                        </Box>

                        {/* 施設名 */}
                        <Typography
                          variant="body2"
                          color="text.secondary"
                          sx={{
                            mt: 1,
                          }}
                        >
                          🏠 {inquiry.facilityName}
                        </Typography>

                        {/* 最終更新 */}
                        <Typography
                          variant="body2"
                          color="text.secondary"
                          sx={{
                            mt: 0.5,
                          }}
                        >
                          🕐 {formatDateTime(inquiry.lastMessageAt)}
                        </Typography>
                      </Box>

                      {/* 詳細画面への視覚的な導線 */}
                      <Typography
                        aria-hidden="true"
                        sx={{
                          display: {
                            xs: "none",
                            sm: "block",
                          },
                          alignSelf: "center",
                          color: "text.secondary",
                          fontSize: 20,
                          fontWeight: 700,
                        }}
                      >
                        ›
                      </Typography>
                    </Box>
                  </Box>
                ))}
              </Stack>
            )}
          </CardContent>
        </Card>

        {/* 施設検索 */}
        <Card>
          <CardContent
            sx={{
              p: {
                xs: 3,
                md: 3.5,
              },
            }}
          >
            <Box
              sx={{
                display: "flex",
                flexDirection: {
                  xs: "column",
                  sm: "row",
                },
                alignItems: {
                  xs: "flex-start",
                  sm: "center",
                },
                justifyContent: "space-between",
                gap: 2,
              }}
            >
              <Box>
                <Typography variant="h6" gutterBottom>
                  🔍 施設を探す
                </Typography>

                <Typography color="text.secondary">
                  空床状況や受け入れ条件から施設を検索できます。
                </Typography>
              </Box>

              <Button
                variant="contained"
                color="secondary"
                onClick={() => {
                  navigate("/facilities");
                }}
              >
                施設を検索する
              </Button>
            </Box>
          </CardContent>
        </Card>
      </Stack>
    </Container>
  );
}
