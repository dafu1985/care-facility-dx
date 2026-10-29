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
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import { getFacility } from "../api/get-facility";

import type {
  AvailabilityStatus,
  FacilitySearchItem,
} from "../types/facility-search";

/**
 * 空き状況を日本語表示へ変換する。
 */
function getAvailabilityLabel(status: AvailabilityStatus): string {
  switch (status) {
    case "AVAILABLE":
      return "空きあり";

    case "FEW":
      return "残りわずか";

    case "FULL":
      return "空きなし";

    case "UNKNOWN":
      return "未確認";

    default:
      return status;
  }
}

/**
 * booleanの受入条件を日本語表示へ変換する。
 */
function getAcceptedLabel(accepted: boolean): string {
  return accepted ? "対応可" : "対応不可";
}

/**
 * CARE_MANAGER向け施設詳細画面。
 */
export function FacilityDetailPage() {
  const navigate = useNavigate();

  const { facilityId } = useParams<{
    facilityId: string;
  }>();

  const [facility, setFacility] = useState<FacilitySearchItem | null>(null);

  const [isLoading, setIsLoading] = useState(true);

  const [error, setError] = useState<string | null>(null);

  /**
   * 施設詳細を取得する。
   */
  useEffect(() => {
    if (!facilityId) {
      return;
    }

    let cancelled = false;

    getFacility(facilityId)
      .then((response) => {
        if (cancelled) {
          return;
        }

        setFacility(response);
        setError(null);
      })
      .catch((error) => {
        if (cancelled) {
          return;
        }

        console.error("施設詳細の取得に失敗しました。", error);

        setError("施設詳細の取得に失敗しました。");
      })
      .finally(() => {
        if (cancelled) {
          return;
        }

        setIsLoading(false);
      });

    /**
     * コンポーネント破棄後に
     * state更新しないようにする。
     */
    return () => {
      cancelled = true;
    };
  }, [facilityId]);

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
   * 施設情報なし。
   */
  if (!facility) {
    return (
      <Container
        maxWidth="md"
        sx={{
          py: 4,
        }}
      >
        <Alert severity="warning">施設情報を取得できませんでした。</Alert>
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
        {/* 戻る */}
        <Box>
          <Button
            onClick={() => {
              navigate("/facilities");
            }}
          >
            ← 施設検索へ戻る
          </Button>
        </Box>

        {/* 施設基本情報 */}
        <Card
          sx={{
            borderRadius: 4,
            background:
              "linear-gradient(135deg, #EEF2FF 0%, #FFF1EC 55%, #E8F7F5 100%)",
            border: "1px solid",
            borderColor: "divider",
            boxShadow: "none",
            overflow: "hidden",
          }}
        >
          <CardContent
            sx={{
              p: { xs: 3, sm: 4 },
              "&:last-child": {
                pb: { xs: 3, sm: 4 },
              },
            }}
          >
            <Stack spacing={1.5}>
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "flex-start",
                  gap: 2,
                }}
              >
                <Box sx={{ minWidth: 0, flex: 1 }}>
                  <Typography
                    variant="overline"
                    sx={{
                      color: "primary.main",
                      fontWeight: 800,
                      letterSpacing: 1.5,
                    }}
                  >
                    FACILITY INFORMATION
                  </Typography>

                  <Typography
                    variant="h4"
                    component="h1"
                    sx={{
                      fontWeight: 800,
                      fontSize: { xs: "1.5rem", sm: "2rem" },
                      lineHeight: 1.5,
                      overflowWrap: "anywhere",
                      mt: 0.5,
                      mb: 1,
                    }}
                  >
                    🏡 {facility.name}
                  </Typography>

                  <Typography
                    variant="body2"
                    sx={{
                      color: "text.secondary",
                      fontWeight: 600,
                    }}
                  >
                    {facility.facilityType?.name ?? "施設種別未登録"}
                  </Typography>
                </Box>

                {facility.availability && (
                  <Chip
                    label={getAvailabilityLabel(facility.availability.status)}
                    size="small"
                    color={
                      facility.availability.status === "AVAILABLE"
                        ? "success"
                        : facility.availability.status === "FEW"
                          ? "warning"
                          : "default"
                    }
                    variant={
                      facility.availability.status === "FULL"
                        ? "outlined"
                        : "filled"
                    }
                    sx={{
                      fontWeight: 700,
                      borderRadius: 2,
                      px: 0.5,
                      flexShrink: 0,
                    }}
                  />
                )}
              </Box>

              <Box
                sx={{
                  bgcolor: "rgba(255, 255, 255, 0.75)",
                  borderRadius: 2.5,
                  p: { xs: 2, sm: 2.5 },
                  mt: 1,
                }}
              >
                <Stack spacing={1.5}>
                  {/* 郵便番号・住所 */}
                  <Box
                    sx={{ display: "flex", gap: 1.5, alignItems: "flex-start" }}
                  >
                    <Typography sx={{ fontSize: "1.1rem", flexShrink: 0 }}>
                      📍
                    </Typography>

                    <Box sx={{ minWidth: 0 }}>
                      <Typography
                        variant="caption"
                        color="text.secondary"
                        sx={{ fontWeight: 600 }}
                      >
                        所在地
                      </Typography>

                      <Typography
                        variant="body2"
                        sx={{ fontWeight: 600, overflowWrap: "anywhere" }}
                      >
                        〒{facility.postalCode ?? "未登録"}
                      </Typography>

                      <Typography
                        variant="body2"
                        sx={{ overflowWrap: "anywhere" }}
                      >
                        {facility.address ?? facility.area}
                      </Typography>
                    </Box>
                  </Box>

                  {/* 電話番号 */}
                  <Box sx={{ display: "flex", gap: 1.5, alignItems: "center" }}>
                    <Typography sx={{ fontSize: "1.1rem", flexShrink: 0 }}>
                      📞
                    </Typography>

                    <Box>
                      <Typography
                        variant="caption"
                        color="text.secondary"
                        sx={{ fontWeight: 600 }}
                      >
                        電話番号
                      </Typography>

                      <Typography variant="body2" sx={{ fontWeight: 600 }}>
                        {facility.phone ?? "未登録"}
                      </Typography>
                    </Box>
                  </Box>
                </Stack>
              </Box>

              {facility.description && (
                <Box
                  sx={{
                    mt: 2,
                    p: { xs: 2, sm: 2.5 },
                    bgcolor: "rgba(255, 255, 255, 0.75)",
                    borderRadius: 2.5,
                  }}
                >
                  <Typography
                    variant="subtitle2"
                    sx={{
                      fontWeight: 800,
                      color: "text.primary",
                      mb: 1,
                    }}
                  >
                    📝 施設について
                  </Typography>

                  <Typography
                    variant="body2"
                    sx={{
                      color: "text.secondary",
                      lineHeight: 1.9,
                      whiteSpace: "pre-wrap",
                      overflowWrap: "anywhere",
                    }}
                  >
                    {facility.description}
                  </Typography>
                </Box>
              )}
            </Stack>
          </CardContent>
        </Card>

        {/* 空き状況 */}
        <Card
          variant="outlined"
          sx={{
            borderRadius: 3,
            borderColor: "divider",
            bgcolor: "background.paper",
            boxShadow: "0 4px 16px rgba(99, 102, 241, 0.04)",
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
            <Typography
              variant="h6"
              component="h2"
              sx={{
                fontWeight: 800,
                mb: 2,
              }}
            >
              🛏️ 空き状況
            </Typography>

            {facility.availability ? (
              <Box
                sx={{
                  display: "grid",
                  gridTemplateColumns: {
                    xs: "1fr",
                    sm: "repeat(3, minmax(0, 1fr))",
                  },
                  gap: 2,
                }}
              >
                {[
                  {
                    icon: "🟢",
                    label: "現在の空き状況",
                    value: getAvailabilityLabel(facility.availability.status),
                  },
                  {
                    icon: "🛏️",
                    label: "空き数",
                    value:
                      facility.availability.availableCount == null
                        ? "未確認"
                        : `${facility.availability.availableCount}床`,
                  },
                  {
                    icon: "📅",
                    label: "入居可能日",
                    value: facility.availability.availableFrom ?? "未確認",
                  },
                ].map((item) => (
                  <Box
                    key={item.label}
                    sx={{
                      p: 2,
                      borderRadius: 2.5,
                      bgcolor: "#F8FAFC",
                      border: "1px solid",
                      borderColor: "divider",
                      minWidth: 0,
                    }}
                  >
                    <Typography
                      variant="caption"
                      sx={{
                        color: "text.secondary",
                        fontWeight: 600,
                      }}
                    >
                      {item.icon} {item.label}
                    </Typography>

                    <Typography
                      variant="h6"
                      sx={{
                        fontWeight: 800,
                        mt: 1,
                        overflowWrap: "anywhere",
                      }}
                    >
                      {item.value}
                    </Typography>
                  </Box>
                ))}
              </Box>
            ) : (
              <Alert severity="info">空き状況は登録されていません。</Alert>
            )}
          </CardContent>
        </Card>

        {/* 料金 */}
        <Card
          variant="outlined"
          sx={{
            borderRadius: 3,
            borderColor: "divider",
            bgcolor: "background.paper",
            boxShadow: "0 4px 16px rgba(99, 102, 241, 0.04)",
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
            <Typography
              variant="h6"
              component="h2"
              sx={{
                fontWeight: 800,
                mb: 2,
              }}
            >
              💰 料金
            </Typography>

            {facility.pricing ? (
              <Stack spacing={2}>
                <Box
                  sx={{
                    display: "grid",
                    gridTemplateColumns: {
                      xs: "1fr",
                      sm: "repeat(2, minmax(0, 1fr))",
                    },
                    gap: 2,
                  }}
                >
                  {/* 月額料金 */}
                  <Box
                    sx={{
                      p: 2.5,
                      borderRadius: 2.5,
                      bgcolor: "#F8FAFC",
                      border: "1px solid",
                      borderColor: "divider",
                      minWidth: 0,
                    }}
                  >
                    <Typography
                      variant="caption"
                      sx={{ color: "text.secondary", fontWeight: 600 }}
                    >
                      💴 月額料金
                    </Typography>

                    <Typography
                      sx={{
                        mt: 1,
                        fontSize: { xs: "1.1rem", sm: "1.25rem" },
                        fontWeight: 800,
                        color: "primary.main",
                        overflowWrap: "anywhere",
                      }}
                    >
                      {facility.pricing.monthlyCostMin.toLocaleString()}
                      {" 〜 "}
                      {facility.pricing.monthlyCostMax.toLocaleString()}
                      <Typography
                        component="span"
                        variant="body2"
                        sx={{ ml: 0.5 }}
                      >
                        円
                      </Typography>
                    </Typography>
                  </Box>

                  {/* 入居一時金 */}
                  <Box
                    sx={{
                      p: 2.5,
                      borderRadius: 2.5,
                      bgcolor: "#F8FAFC",
                      border: "1px solid",
                      borderColor: "divider",
                      minWidth: 0,
                    }}
                  >
                    <Typography
                      variant="caption"
                      sx={{ color: "text.secondary", fontWeight: 600 }}
                    >
                      🏠 入居一時金
                    </Typography>

                    <Typography
                      sx={{
                        mt: 1,
                        fontSize: { xs: "1.1rem", sm: "1.25rem" },
                        fontWeight: 800,
                        overflowWrap: "anywhere",
                      }}
                    >
                      {facility.pricing.entranceFee.toLocaleString()}
                      <Typography
                        component="span"
                        variant="body2"
                        sx={{ ml: 0.5 }}
                      >
                        円
                      </Typography>
                    </Typography>
                  </Box>
                </Box>

                {/* 料金備考 */}
                {facility.pricing.note && (
                  <Box
                    sx={{
                      p: 2,
                      borderRadius: 2,
                      bgcolor: "#F8FAFC",
                    }}
                  >
                    <Typography
                      variant="body2"
                      color="text.secondary"
                      sx={{ lineHeight: 1.8, whiteSpace: "pre-wrap" }}
                    >
                      📝 {facility.pricing.note}
                    </Typography>
                  </Box>
                )}
              </Stack>
            ) : (
              <Alert severity="info">料金情報は登録されていません。</Alert>
            )}
          </CardContent>
        </Card>

        {/* 受入条件 */}
        <Card
          variant="outlined"
          sx={{
            borderRadius: 3,
            borderColor: "divider",
            bgcolor: "background.paper",
            boxShadow: "0 4px 16px rgba(99, 102, 241, 0.04)",
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
            <Typography
              variant="h6"
              component="h2"
              sx={{
                fontWeight: 800,
                mb: 2,
              }}
            >
              🤝 受入条件
            </Typography>

            {facility.requirement ? (
              <Stack spacing={2}>
                {/* 要介護度 */}
                <Box
                  sx={{
                    p: 2.5,
                    borderRadius: 2.5,
                    bgcolor: "#EEF2FF",
                  }}
                >
                  <Typography
                    variant="caption"
                    sx={{ color: "text.secondary", fontWeight: 600 }}
                  >
                    🧑‍🦽 対応可能な要介護度
                  </Typography>

                  <Typography
                    variant="h6"
                    sx={{
                      mt: 1,
                      fontWeight: 800,
                      color: "primary.main",
                    }}
                  >
                    {facility.requirement.minCareLevel ?? "未設定"}
                    {" 〜 "}
                    {facility.requirement.maxCareLevel ?? "未設定"}
                  </Typography>
                </Box>

                {/* 受入条件一覧 */}
                <Box
                  sx={{
                    display: "grid",
                    gridTemplateColumns: {
                      xs: "1fr",
                      sm: "repeat(2, minmax(0, 1fr))",
                    },
                    gap: 2,
                  }}
                >
                  {[
                    {
                      label: "認知症",
                      icon: "🧠",
                      accepted: facility.requirement.dementiaAccepted,
                    },
                    {
                      label: "医療ケア",
                      icon: "🏥",
                      accepted: facility.requirement.medicalCareAccepted,
                    },
                    {
                      label: "車椅子",
                      icon: "♿",
                      accepted: facility.requirement.wheelchairAccepted,
                    },
                    {
                      label: "看取り",
                      icon: "🤝",
                      accepted: facility.requirement.endOfLifeCare,
                    },
                  ].map((item) => (
                    <Box
                      key={item.label}
                      sx={{
                        p: 2,
                        borderRadius: 2.5,
                        bgcolor: "#F8FAFC",
                        border: "1px solid",
                        borderColor: "divider",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        gap: 1,
                      }}
                    >
                      <Typography variant="body2" sx={{ fontWeight: 700 }}>
                        {item.icon} {item.label}
                      </Typography>

                      <Chip
                        label={getAcceptedLabel(item.accepted)}
                        color={item.accepted ? "success" : "default"}
                        variant={item.accepted ? "filled" : "outlined"}
                        size="small"
                        sx={{
                          fontWeight: 700,
                          borderRadius: 2,
                          flexShrink: 0,
                        }}
                      />
                    </Box>
                  ))}
                </Box>

                {/* 備考 */}
                {facility.requirement.note && (
                  <Box
                    sx={{
                      p: 2,
                      borderRadius: 2,
                      bgcolor: "#F8FAFC",
                    }}
                  >
                    <Typography
                      variant="body2"
                      color="text.secondary"
                      sx={{
                        lineHeight: 1.8,
                        whiteSpace: "pre-wrap",
                      }}
                    >
                      📝 {facility.requirement.note}
                    </Typography>
                  </Box>
                )}
              </Stack>
            ) : (
              <Alert severity="info">受入条件は登録されていません。</Alert>
            )}
          </CardContent>
        </Card>

        {/* 問い合わせ */}
        <Card
          sx={{
            borderRadius: 4,
            background:
              "linear-gradient(135deg, #EEF2FF 0%, #FFF1EC 55%, #E8F7F5 100%)",
            border: "1px solid",
            borderColor: "divider",
            boxShadow: "none",
          }}
        >
          <CardContent
            sx={{
              p: { xs: 3, sm: 4 },
              "&:last-child": {
                pb: { xs: 3, sm: 4 },
              },
            }}
          >
            <Stack spacing={2.5} sx={{ alignItems: "flex-start" }}>
              <Box>
                <Typography
                  variant="h6"
                  component="h2"
                  sx={{ fontWeight: 800, mb: 1 }}
                >
                  💬 この施設について問い合わせる
                </Typography>

                <Typography
                  variant="body2"
                  color="text.secondary"
                  sx={{ lineHeight: 1.9 }}
                >
                  空き状況や受入条件について、 施設へ直接問い合わせできます。
                </Typography>
              </Box>

              <Button
                variant="contained"
                size="large"
                onClick={() => {
                  navigate(`/facilities/${facility.facilityId}/inquiry`);
                }}
                sx={{
                  bgcolor: "#6366F1",
                  borderRadius: 2.5,
                  px: 4,
                  py: 1.5,
                  fontWeight: 800,
                  textTransform: "none",
                  boxShadow: "0 6px 18px rgba(99, 102, 241, 0.2)",
                  "&:hover": {
                    bgcolor: "#4F46E5",
                  },
                }}
              >
                ✉️ この施設に問い合わせる
              </Button>
            </Stack>
          </CardContent>
        </Card>
      </Stack>
    </Container>
  );
}
