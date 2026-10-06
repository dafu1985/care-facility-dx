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

import { getCandidateFacilities } from "../api/get-candidate-facilities";
import { getCaseMedicalRequirements } from "../api/get-case-medical-requirements";
import { getClientCondition } from "../api/get-client-condition";
import { getPlacementCase } from "../api/get-placement-case";
import { runPlacementMatching } from "../api/run-placement-matching";

import type {
  CandidateFacility,
  CandidateFacilityStatus,
} from "../types/candidate-facility";
import type {
  CaseMedicalRequirement,
  MedicalRequirementLevel,
} from "../types/case-medical-requirement";
import type { ClientCondition } from "../types/client-condition";
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
 * 候補施設ステータスを日本語へ変換する。
 */
function getCandidateFacilityStatusLabel(
  status: CandidateFacilityStatus,
): string {
  switch (status) {
    case "CONSIDERING":
      return "検討中";
    case "INQUIRING":
      return "問い合わせ中";
    case "AVAILABLE":
      return "受入可能";
    case "VISIT_SCHEDULED":
      return "見学予定";
    case "APPLIED":
      return "申込済み";
    case "ACCEPTED":
      return "受入決定";
    case "REJECTED":
      return "施設側見送り";
    case "DECLINED":
      return "候補から除外";
    default:
      return status;
  }
}

/**
 * 候補施設ステータスに応じたChip色を返す。
 */
function getCandidateFacilityStatusColor(
  status: CandidateFacilityStatus,
):
  | "default"
  | "primary"
  | "secondary"
  | "error"
  | "info"
  | "success"
  | "warning" {
  switch (status) {
    case "CONSIDERING":
      return "default";
    case "INQUIRING":
      return "warning";
    case "AVAILABLE":
      return "success";
    case "VISIT_SCHEDULED":
      return "info";
    case "APPLIED":
      return "primary";
    case "ACCEPTED":
      return "success";
    case "REJECTED":
      return "error";
    case "DECLINED":
      return "default";
    default:
      return "default";
  }
}

/**
 * 日付を日本語表示用に整形する。
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
 * 金額を日本円表示用に整形する。
 */
function formatCurrency(value: number | null): string {
  if (value === null) {
    return "未設定";
  }

  return `${new Intl.NumberFormat("ja-JP").format(value)}円`;
}

/**
 * 緊急度を日本語表示用に変換する。
 */
function getUrgencyLabel(urgency: string | null): string {
  switch (urgency) {
    case "HIGH":
      return "高";
    case "MEDIUM":
      return "中";
    case "LOW":
      return "低";
    case null:
      return "未設定";
    default:
      return urgency;
  }
}

/**
 * 年代を日本語表示用に変換する。
 */
function getAgeGroupLabel(ageGroup: string | null): string {
  if (!ageGroup) {
    return "未設定";
  }

  const match = ageGroup.match(/^(\d+)s$/);

  if (match) {
    return `${match[1]}代`;
  }

  return ageGroup;
}

/**
 * 性別を日本語表示用に変換する。
 */
function getGenderLabel(gender: string | null): string {
  switch (gender) {
    case "MALE":
      return "男性";
    case "FEMALE":
      return "女性";
    case "OTHER":
      return "その他";
    case null:
      return "未設定";
    default:
      return gender;
  }
}

/**
 * 要介護度を日本語表示用に変換する。
 */
function getCareLevelLabel(careLevel: string | null): string {
  if (!careLevel) {
    return "未設定";
  }

  const careMatch = careLevel.match(/^CARE_(\d+)$/);

  if (careMatch) {
    return `要介護${careMatch[1]}`;
  }

  const supportMatch = careLevel.match(/^SUPPORT_(\d+)$/);

  if (supportMatch) {
    return `要支援${supportMatch[1]}`;
  }

  return careLevel;
}

/**
 * 医療条件の重要度を日本語へ変換する。
 */
function getMedicalRequirementLevelLabel(
  level: MedicalRequirementLevel,
): string {
  switch (level) {
    case "REQUIRED":
      return "必須";
    case "PREFERRED":
      return "希望";
    default:
      return level;
  }
}

/**
 * 医療条件の重要度に応じたChip色を返す。
 */
function getMedicalRequirementLevelColor(
  level: MedicalRequirementLevel,
): "error" | "info" {
  switch (level) {
    case "REQUIRED":
      return "error";
    case "PREFERRED":
      return "info";
  }
}

/**
 * 施設探し案件詳細画面。
 */
export function PlacementCaseDetailPage() {
  const navigate = useNavigate();

  const { placementCaseId } = useParams<{
    placementCaseId: string;
  }>();

  /**
   * 案件詳細。
   */
  const [placementCase, setPlacementCase] = useState<PlacementCase | null>(
    null,
  );

  /**
   * 利用者条件。
   */
  const [clientCondition, setClientCondition] =
    useState<ClientCondition | null>(null);

  /**
   * 医療条件一覧。
   */
  const [medicalRequirements, setMedicalRequirements] = useState<
    CaseMedicalRequirement[]
  >([]);

  /**
   * 候補施設一覧。
   */
  const [candidateFacilities, setCandidateFacilities] = useState<
    CandidateFacility[]
  >([]);

  /**
   * 初期表示の読み込み状態。
   */
  const [isLoading, setIsLoading] = useState(true);

  /**
   * マッチング実行中かどうか。
   */
  const [isMatching, setIsMatching] = useState(false);

  /**
   * 初期表示APIエラー。
   */
  const [error, setError] = useState<string | null>(null);

  /**
   * マッチングAPIエラー。
   */
  const [matchingError, setMatchingError] = useState<string | null>(null);

  /**
   * マッチング成功メッセージ。
   */
  const [matchingMessage, setMatchingMessage] = useState<string | null>(null);

  useEffect(() => {
    if (!placementCaseId) {
      return;
    }

    let cancelled = false;

    /**
     * 案件基本情報・利用者条件・医療条件・既存候補施設を
     * 並列取得する。
     */
    Promise.all([
      getPlacementCase(placementCaseId),
      getClientCondition(placementCaseId),
      getCaseMedicalRequirements(placementCaseId),
      getCandidateFacilities(placementCaseId),
    ])
      .then(
        ([
          placementCaseResponse,
          clientConditionResponse,
          medicalRequirementsResponse,
          candidateFacilitiesResponse,
        ]) => {
          if (cancelled) {
            return;
          }

          setPlacementCase(placementCaseResponse);
          setClientCondition(clientConditionResponse);

          /**
           * 医療条件はBackendマスタの表示順に並べる。
           */
          setMedicalRequirements(
            [...medicalRequirementsResponse].sort(
              (a, b) =>
                a.medicalCondition.displayOrder -
                b.medicalCondition.displayOrder,
            ),
          );

          /**
           * 候補施設はマッチスコアの高い順に表示する。
           */
          setCandidateFacilities(
            [...candidateFacilitiesResponse].sort(
              (a, b) => (b.matchScore ?? 0) - (a.matchScore ?? 0),
            ),
          );

          setError(null);
        },
      )
      .catch((error) => {
        if (cancelled) {
          return;
        }

        console.error("施設探し案件詳細の取得に失敗しました。", error);

        setError(
          "施設探し案件詳細の取得に失敗しました。時間をおいて再度お試しください。",
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
  }, [placementCaseId]);

  /**
   * マッチングを実行する。
   *
   * POST /matching のレスポンスには施設詳細が含まれないため、
   * マッチング完了後に GET /candidates を実行して
   * 施設情報付きの最新候補一覧を取得する。
   */
  async function handleRunMatching() {
    if (!placementCaseId || isMatching) {
      return;
    }

    setIsMatching(true);
    setMatchingError(null);
    setMatchingMessage(null);

    try {
      await runPlacementMatching(placementCaseId);

      const latestCandidates = await getCandidateFacilities(placementCaseId);

      const sortedCandidates = [...latestCandidates].sort(
        (a, b) => (b.matchScore ?? 0) - (a.matchScore ?? 0),
      );

      setCandidateFacilities(sortedCandidates);

      if (sortedCandidates.length === 0) {
        setMatchingMessage("現在の条件に一致する候補施設はありませんでした。");
      } else {
        setMatchingMessage(
          `${sortedCandidates.length}件の候補施設が見つかりました。`,
        );
      }
    } catch (error) {
      console.error("施設マッチングの実行に失敗しました。", error);

      setMatchingError(
        "施設の検索に失敗しました。時間をおいて再度お試しください。",
      );
    } finally {
      setIsMatching(false);
    }
  }

  /**
   * URLに案件IDが存在しない場合。
   */
  if (!placementCaseId) {
    return (
      <Container
        maxWidth="lg"
        sx={{
          py: 4,
        }}
      >
        <Stack spacing={2}>
          <Alert severity="error">案件IDが指定されていません。</Alert>

          <Box>
            <Button
              variant="outlined"
              onClick={() => {
                navigate("/placement-cases");
              }}
            >
              案件一覧へ戻る
            </Button>
          </Box>
        </Stack>
      </Container>
    );
  }

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
        <Stack spacing={2}>
          <Alert severity="error">{error}</Alert>

          <Box>
            <Button
              variant="outlined"
              onClick={() => {
                navigate("/placement-cases");
              }}
            >
              案件一覧へ戻る
            </Button>
          </Box>
        </Stack>
      </Container>
    );
  }

  /**
   * 案件情報が取得できなかった場合。
   */
  if (!placementCase) {
    return (
      <Container
        maxWidth="lg"
        sx={{
          py: 4,
        }}
      >
        <Stack spacing={2}>
          <Alert severity="warning">案件情報が見つかりませんでした。</Alert>

          <Box>
            <Button
              variant="outlined"
              onClick={() => {
                navigate("/placement-cases");
              }}
            >
              案件一覧へ戻る
            </Button>
          </Box>
        </Stack>
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
        {/* 戻るナビゲーション */}
        <Box>
          <Button
            variant="text"
            onClick={() => {
              navigate("/placement-cases");
            }}
            sx={{
              px: 0,
              color: "text.secondary",
              "&:hover": {
                bgcolor: "transparent",
                color: "primary.main",
              },
            }}
          >
            ← 施設探し案件へ戻る
          </Button>
        </Box>

        {/* 案件ヘッダー */}
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
          {/* 背景装飾 */}
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
              gap: 2,
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
                PLACEMENT CASE
              </Typography>

              <Stack
                direction="row"
                spacing={1.5}
                sx={{
                  alignItems: "center",
                }}
              >
                <Box
                  sx={{
                    width: 48,
                    height: 48,
                    flexShrink: 0,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    borderRadius: 3,
                    bgcolor: "rgba(255,255,255,0.75)",
                    fontSize: "1.4rem",
                  }}
                >
                  📋
                </Box>

                <Box>
                  <Typography
                    variant="h4"
                    component="h1"
                    sx={{
                      lineHeight: 1.25,
                    }}
                  >
                    {placementCase.caseCode}
                  </Typography>

                  <Typography
                    color="text.secondary"
                    sx={{
                      mt: 0.5,
                    }}
                  >
                    施設探し案件の詳細
                  </Typography>
                </Box>
              </Stack>
            </Stack>

            <Chip
              label={getPlacementCaseStatusLabel(placementCase.status)}
              color={getPlacementCaseStatusColor(placementCase.status)}
              sx={{
                fontWeight: 700,
              }}
            />
          </Box>
        </Box>

        {/* 案件基本情報 */}
        <Card>
          <CardContent
            sx={{
              p: {
                xs: 3,
                md: 3.5,
              },
              "&:last-child": {
                pb: {
                  xs: 3,
                  md: 3.5,
                },
              },
            }}
          >
            <Stack spacing={3}>
              {/* セクションタイトル */}
              <Stack
                direction="row"
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
                  <Typography variant="h6">案件基本情報</Typography>

                  <Typography variant="body2" color="text.secondary">
                    この施設探し案件の基本情報です。
                  </Typography>
                </Box>
              </Stack>

              {/* 基本情報 */}
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
                {/* 案件コード */}
                <Box
                  sx={{
                    p: 2,
                    borderRadius: 3,
                    bgcolor: "background.default",
                  }}
                >
                  <Typography variant="caption" color="text.secondary">
                    🏷️ 案件コード
                  </Typography>

                  <Typography
                    sx={{
                      mt: 0.5,
                      fontWeight: 700,
                    }}
                  >
                    {placementCase.caseCode}
                  </Typography>
                </Box>

                {/* ステータス */}
                <Box
                  sx={{
                    p: 2,
                    borderRadius: 3,
                    bgcolor: "background.default",
                  }}
                >
                  <Typography variant="caption" color="text.secondary">
                    📌 ステータス
                  </Typography>

                  <Box sx={{ mt: 0.75 }}>
                    <Chip
                      label={getPlacementCaseStatusLabel(placementCase.status)}
                      color={getPlacementCaseStatusColor(placementCase.status)}
                      size="small"
                    />
                  </Box>
                </Box>

                {/* 入居希望日 */}
                <Box
                  sx={{
                    p: 2,
                    borderRadius: 3,
                    bgcolor: "background.default",
                  }}
                >
                  <Typography variant="caption" color="text.secondary">
                    📅 入居希望日
                  </Typography>

                  <Typography
                    sx={{
                      mt: 0.5,
                      fontWeight: 700,
                    }}
                  >
                    {formatDate(placementCase.desiredMoveInDate)}
                  </Typography>
                </Box>

                {/* 緊急度 */}
                <Box
                  sx={{
                    p: 2,
                    borderRadius: 3,
                    bgcolor: "background.default",
                  }}
                >
                  <Typography variant="caption" color="text.secondary">
                    ⚡ 緊急度
                  </Typography>

                  <Typography
                    sx={{
                      mt: 0.5,
                      fontWeight: 700,
                    }}
                  >
                    {getUrgencyLabel(placementCase.urgency)}
                  </Typography>
                </Box>
              </Box>

              {/* メモ */}
              <Box
                sx={{
                  p: 2,
                  borderRadius: 3,
                  bgcolor: "secondary.light",
                }}
              >
                <Typography variant="caption" color="text.secondary">
                  📝 メモ
                </Typography>

                <Typography
                  variant="body2"
                  sx={{
                    mt: 0.75,
                    whiteSpace: "pre-wrap",
                  }}
                >
                  {placementCase.note ?? "未設定"}
                </Typography>
              </Box>

              {/* 日時 */}
              <Box
                sx={{
                  display: "flex",
                  flexDirection: {
                    xs: "column",
                    sm: "row",
                  },
                  justifyContent: "space-between",
                  gap: 1,
                  pt: 0.5,
                }}
              >
                <Typography variant="caption" color="text.secondary">
                  作成日：
                  {formatDate(placementCase.createdAt)}
                </Typography>

                <Typography variant="caption" color="text.secondary">
                  最終更新：
                  {formatDate(placementCase.updatedAt)}
                </Typography>
              </Box>
            </Stack>
          </CardContent>
        </Card>

        {/* 利用者条件 */}
        <Card>
          <CardContent
            sx={{
              p: {
                xs: 3,
                md: 3.5,
              },
              "&:last-child": {
                pb: {
                  xs: 3,
                  md: 3.5,
                },
              },
            }}
          >
            <Stack spacing={3}>
              {/* セクションヘッダー */}
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
                <Stack
                  direction="row"
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
                      bgcolor: "secondary.light",
                      fontSize: "1.25rem",
                    }}
                  >
                    👤
                  </Box>

                  <Box>
                    <Typography variant="h6">利用者条件</Typography>

                    <Typography variant="body2" color="text.secondary">
                      施設探しに使用する利用者の希望条件です。
                    </Typography>
                  </Box>
                </Stack>

                <Button
                  variant="outlined"
                  size="small"
                  onClick={() => {
                    navigate(`/placement-cases/${placementCaseId}/conditions`);
                  }}
                >
                  {clientCondition ? "条件を編集" : "利用者条件を登録"}
                </Button>
              </Box>

              {!clientCondition ? (
                /* 未登録 */
                <Box
                  sx={{
                    p: 3,
                    borderRadius: 3,
                    bgcolor: "warning.light",
                    textAlign: "center",
                  }}
                >
                  <Typography
                    sx={{
                      fontSize: "2rem",
                      mb: 1,
                    }}
                  >
                    👤
                  </Typography>

                  <Typography
                    sx={{
                      fontWeight: 700,
                    }}
                  >
                    利用者条件が登録されていません
                  </Typography>

                  <Typography
                    variant="body2"
                    color="text.secondary"
                    sx={{
                      mt: 0.5,
                    }}
                  >
                    マッチングを行うために利用者条件を登録してください。
                  </Typography>
                </Box>
              ) : (
                <Stack spacing={2}>
                  {/* 主要条件 */}
                  <Box
                    sx={{
                      display: "grid",
                      gridTemplateColumns: {
                        xs: "1fr",
                        sm: "repeat(2, minmax(0, 1fr))",
                        md: "repeat(3, minmax(0, 1fr))",
                      },
                      gap: 2,
                    }}
                  >
                    {/* 年代 */}
                    <Box
                      sx={{
                        p: 2,
                        borderRadius: 3,
                        bgcolor: "background.default",
                      }}
                    >
                      <Typography variant="caption" color="text.secondary">
                        🎂 年代
                      </Typography>

                      <Typography
                        sx={{
                          mt: 0.5,
                          fontWeight: 700,
                        }}
                      >
                        {getAgeGroupLabel(clientCondition.ageGroup)}
                      </Typography>
                    </Box>

                    {/* 性別 */}
                    <Box
                      sx={{
                        p: 2,
                        borderRadius: 3,
                        bgcolor: "background.default",
                      }}
                    >
                      <Typography variant="caption" color="text.secondary">
                        👤 性別
                      </Typography>

                      <Typography
                        sx={{
                          mt: 0.5,
                          fontWeight: 700,
                        }}
                      >
                        {getGenderLabel(clientCondition.gender)}
                      </Typography>
                    </Box>

                    {/* 要介護度 */}
                    <Box
                      sx={{
                        p: 2,
                        borderRadius: 3,
                        bgcolor: "background.default",
                      }}
                    >
                      <Typography variant="caption" color="text.secondary">
                        ♿ 要介護度
                      </Typography>

                      <Typography
                        sx={{
                          mt: 0.5,
                          fontWeight: 700,
                        }}
                      >
                        {getCareLevelLabel(clientCondition.careLevel)}
                      </Typography>
                    </Box>

                    {/* 月額予算 */}
                    <Box
                      sx={{
                        p: 2,
                        borderRadius: 3,
                        bgcolor: "background.default",
                      }}
                    >
                      <Typography variant="caption" color="text.secondary">
                        💴 月額予算上限
                      </Typography>

                      <Typography
                        sx={{
                          mt: 0.5,
                          fontWeight: 700,
                        }}
                      >
                        {formatCurrency(clientCondition.budgetMax)}
                      </Typography>
                    </Box>

                    {/* 希望地域 */}
                    <Box
                      sx={{
                        p: 2,
                        borderRadius: 3,
                        bgcolor: "background.default",
                      }}
                    >
                      <Typography variant="caption" color="text.secondary">
                        📍 希望地域
                      </Typography>

                      <Typography
                        sx={{
                          mt: 0.5,
                          fontWeight: 700,
                        }}
                      >
                        {clientCondition.desiredArea ?? "未設定"}
                      </Typography>
                    </Box>

                    {/* 入居希望日 */}
                    <Box
                      sx={{
                        p: 2,
                        borderRadius: 3,
                        bgcolor: "background.default",
                      }}
                    >
                      <Typography variant="caption" color="text.secondary">
                        📅 入居希望日
                      </Typography>

                      <Typography
                        sx={{
                          mt: 0.5,
                          fontWeight: 700,
                        }}
                      >
                        {formatDate(clientCondition.desiredMoveInDate)}
                      </Typography>
                    </Box>
                  </Box>

                  {/* 補足条件 */}
                  <Box
                    sx={{
                      p: 2,
                      borderRadius: 3,
                      bgcolor: "#F8F9FD",
                    }}
                  >
                    <Typography
                      variant="caption"
                      color="text.secondary"
                      sx={{
                        display: "block",
                        mb: 1.5,
                      }}
                    >
                      その他の条件
                    </Typography>

                    <Stack
                      direction="row"
                      spacing={1}
                      useFlexGap
                      sx={{
                        flexWrap: "wrap",
                      }}
                    >
                      <Chip
                        size="small"
                        label={`生活保護 ${
                          clientCondition.publicAssistance ? "あり" : "なし"
                        }`}
                        color={
                          clientCondition.publicAssistance
                            ? "success"
                            : "default"
                        }
                        variant={
                          clientCondition.publicAssistance
                            ? "filled"
                            : "outlined"
                        }
                      />

                      <Chip
                        size="small"
                        label={`身元保証人 ${
                          clientCondition.guarantorAvailable ? "あり" : "なし"
                        }`}
                        color={
                          clientCondition.guarantorAvailable
                            ? "success"
                            : "default"
                        }
                        variant={
                          clientCondition.guarantorAvailable
                            ? "filled"
                            : "outlined"
                        }
                      />

                      <Chip
                        size="small"
                        label={`認知症 ${
                          clientCondition.dementia ? "あり" : "なし"
                        }`}
                        color={clientCondition.dementia ? "warning" : "default"}
                        variant={
                          clientCondition.dementia ? "filled" : "outlined"
                        }
                      />

                      <Chip
                        size="small"
                        label={`看取り希望 ${
                          clientCondition.endOfLifeCare ? "あり" : "なし"
                        }`}
                        color={
                          clientCondition.endOfLifeCare ? "info" : "default"
                        }
                        variant={
                          clientCondition.endOfLifeCare ? "filled" : "outlined"
                        }
                      />
                    </Stack>
                  </Box>
                </Stack>
              )}
            </Stack>
          </CardContent>
        </Card>

        {/* 医療条件 */}
        <Card>
          <CardContent
            sx={{
              p: {
                xs: 3,
                md: 3.5,
              },
              "&:last-child": {
                pb: {
                  xs: 3,
                  md: 3.5,
                },
              },
            }}
          >
            <Stack spacing={3}>
              {/* セクションヘッダー */}
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
                <Stack
                  direction="row"
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
                      bgcolor: "#E8F7F5",
                      fontSize: "1.25rem",
                    }}
                  >
                    🏥
                  </Box>

                  <Box>
                    <Typography variant="h6">医療条件</Typography>

                    <Typography variant="body2" color="text.secondary">
                      施設選定で考慮する医療対応条件です。
                    </Typography>
                  </Box>
                </Stack>

                <Button
                  variant="outlined"
                  size="small"
                  onClick={() => {
                    navigate(
                      `/placement-cases/${placementCaseId}/medical-requirements`,
                    );
                  }}
                >
                  {medicalRequirements.length === 0
                    ? "医療条件を登録"
                    : "条件を編集"}
                </Button>
              </Box>

              {medicalRequirements.length === 0 ? (
                /* 医療条件未登録 */
                <Box
                  sx={{
                    p: 3,
                    borderRadius: 3,
                    bgcolor: "#F8F9FD",
                    textAlign: "center",
                  }}
                >
                  <Typography
                    sx={{
                      fontSize: "2rem",
                      mb: 1,
                    }}
                  >
                    🏥
                  </Typography>

                  <Typography
                    sx={{
                      fontWeight: 700,
                    }}
                  >
                    医療条件は登録されていません
                  </Typography>

                  <Typography
                    variant="body2"
                    color="text.secondary"
                    sx={{
                      mt: 0.5,
                    }}
                  >
                    必要な医療対応がある場合は条件を登録してください。
                  </Typography>
                </Box>
              ) : (
                /* 登録済み医療条件 */
                <Stack spacing={1.5}>
                  {medicalRequirements.map((requirement) => (
                    <Box
                      key={requirement.caseMedicalRequirementId}
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
                        p: 2,
                        borderRadius: 3,
                        bgcolor:
                          requirement.requirementLevel === "REQUIRED"
                            ? "#FFF5F3"
                            : "#F3F7FF",
                        border: "1px solid",
                        borderColor:
                          requirement.requirementLevel === "REQUIRED"
                            ? "rgba(244, 67, 54, 0.12)"
                            : "rgba(33, 150, 243, 0.12)",
                      }}
                    >
                      <Stack
                        direction="row"
                        spacing={1.5}
                        sx={{
                          alignItems: "flex-start",
                          minWidth: 0,
                        }}
                      >
                        <Box
                          sx={{
                            width: 36,
                            height: 36,
                            flexShrink: 0,
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            borderRadius: 2,
                            bgcolor: "rgba(255,255,255,0.8)",
                          }}
                        >
                          {requirement.requirementLevel === "REQUIRED"
                            ? "⚕️"
                            : "💙"}
                        </Box>

                        <Box sx={{ minWidth: 0 }}>
                          <Typography
                            sx={{
                              fontWeight: 700,
                            }}
                          >
                            {requirement.medicalCondition.name}
                          </Typography>

                          {requirement.note && (
                            <Typography
                              variant="body2"
                              color="text.secondary"
                              sx={{
                                mt: 0.5,
                                whiteSpace: "pre-wrap",
                              }}
                            >
                              {requirement.note}
                            </Typography>
                          )}
                        </Box>
                      </Stack>

                      <Chip
                        size="small"
                        label={getMedicalRequirementLevelLabel(
                          requirement.requirementLevel,
                        )}
                        color={getMedicalRequirementLevelColor(
                          requirement.requirementLevel,
                        )}
                        sx={{
                          flexShrink: 0,
                          fontWeight: 700,
                        }}
                      />
                    </Box>
                  ))}
                </Stack>
              )}
            </Stack>
          </CardContent>
        </Card>

        {/* マッチング・候補施設 */}
        <Card>
          <CardContent
            sx={{
              p: {
                xs: 3,
                md: 3.5,
              },
              "&:last-child": {
                pb: {
                  xs: 3,
                  md: 3.5,
                },
              },
            }}
          >
            <Stack spacing={3}>
              {/* セクションヘッダー */}
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: {
                    xs: "stretch",
                    sm: "center",
                  },
                  flexDirection: {
                    xs: "column",
                    sm: "row",
                  },
                  gap: 2,
                }}
              >
                <Stack
                  direction="row"
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
                      bgcolor: "#EEF2FF",
                      fontSize: "1.25rem",
                    }}
                  >
                    🔍
                  </Box>

                  <Box>
                    <Typography variant="h6">候補施設</Typography>

                    <Typography variant="body2" color="text.secondary">
                      登録した条件をもとに、入居候補となる施設を探します。
                    </Typography>
                  </Box>
                </Stack>

                <Button
                  variant="contained"
                  disabled={isMatching}
                  onClick={() => {
                    void handleRunMatching();
                  }}
                  sx={{
                    minWidth: {
                      sm: 150,
                    },
                  }}
                >
                  {isMatching ? "検索中..." : "🔍 施設を検索"}
                </Button>
              </Box>

              {/* マッチングエラー */}
              {matchingError && <Alert severity="error">{matchingError}</Alert>}

              {/* マッチング結果メッセージ */}
              {matchingMessage && (
                <Alert
                  severity={candidateFacilities.length > 0 ? "success" : "info"}
                >
                  {matchingMessage}
                </Alert>
              )}

              {/* マッチング実行中 */}
              {isMatching && (
                <Box
                  sx={{
                    py: 5,
                    textAlign: "center",
                  }}
                >
                  <CircularProgress size={36} />

                  <Typography
                    variant="body2"
                    color="text.secondary"
                    sx={{
                      mt: 2,
                    }}
                  >
                    条件に合う施設を探しています...
                  </Typography>
                </Box>
              )}

              {/* 候補施設なし */}
              {!isMatching && candidateFacilities.length === 0 && (
                <Box
                  sx={{
                    py: 5,
                    px: 3,
                    borderRadius: 3,
                    bgcolor: "#F8F9FD",
                    textAlign: "center",
                  }}
                >
                  <Typography
                    sx={{
                      fontSize: "2.5rem",
                      mb: 1,
                    }}
                  >
                    🏠
                  </Typography>

                  <Typography
                    sx={{
                      fontWeight: 700,
                    }}
                  >
                    候補施設はまだありません
                  </Typography>

                  <Typography
                    variant="body2"
                    color="text.secondary"
                    sx={{
                      mt: 0.75,
                    }}
                  >
                    「施設を検索」を押すと、登録した条件をもとに候補施設を探します。
                  </Typography>
                </Box>
              )}

              {/* 候補施設一覧 */}
              {!isMatching && candidateFacilities.length > 0 && (
                <Stack spacing={2}>
                  {/* 件数 */}
                  <Box
                    sx={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      gap: 2,
                    }}
                  >
                    <Typography variant="body2" color="text.secondary">
                      マッチ度の高い順に表示しています。
                    </Typography>

                    <Chip
                      size="small"
                      label={`${candidateFacilities.length}件`}
                      color="primary"
                      variant="outlined"
                      sx={{
                        fontWeight: 700,
                      }}
                    />
                  </Box>

                  {candidateFacilities.map((candidate, index) => (
                    <Card
                      key={candidate.candidateFacilityId}
                      variant="outlined"
                      sx={{
                        position: "relative",
                        overflow: "hidden",
                        borderRadius: 3,
                        borderColor: index === 0 ? "primary.main" : "divider",
                        transition:
                          "transform 0.2s ease, box-shadow 0.2s ease, border-color 0.2s ease",
                        "&:hover": {
                          transform: "translateY(-2px)",
                          boxShadow: 4,
                          borderColor: "primary.main",
                        },
                      }}
                    >
                      {/* 1位候補 */}
                      {index === 0 && (
                        <Box
                          sx={{
                            position: "absolute",
                            top: 0,
                            left: 0,
                            px: 1.5,
                            py: 0.5,
                            bgcolor: "primary.main",
                            color: "primary.contrastText",
                            borderBottomRightRadius: 12,
                            fontSize: "0.7rem",
                            fontWeight: 800,
                            letterSpacing: "0.05em",
                          }}
                        >
                          TOP MATCH
                        </Box>
                      )}

                      <CardContent
                        sx={{
                          p: {
                            xs: 2.5,
                            md: 3,
                          },
                          pt:
                            index === 0
                              ? {
                                  xs: 5,
                                  md: 5,
                                }
                              : undefined,
                          "&:last-child": {
                            pb: {
                              xs: 2.5,
                              md: 3,
                            },
                          },
                        }}
                      >
                        <Stack spacing={2.5}>
                          {/* 施設名・スコア */}
                          <Box
                            sx={{
                              display: "flex",
                              justifyContent: "space-between",
                              alignItems: {
                                xs: "flex-start",
                                md: "center",
                              },
                              flexDirection: {
                                xs: "column",
                                md: "row",
                              },
                              gap: 2,
                            }}
                          >
                            <Stack
                              direction="row"
                              spacing={1.5}
                              sx={{
                                alignItems: "flex-start",
                                minWidth: 0,
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
                                  bgcolor: "#FFF1EC",
                                  fontSize: "1.25rem",
                                }}
                              >
                                🏠
                              </Box>

                              <Box
                                sx={{
                                  minWidth: 0,
                                }}
                              >
                                <Typography variant="h6" component="h3">
                                  {candidate.facility?.name ?? "施設名不明"}
                                </Typography>

                                <Typography
                                  variant="body2"
                                  color="text.secondary"
                                  sx={{
                                    mt: 0.25,
                                  }}
                                >
                                  📍{" "}
                                  {candidate.facility?.area ?? "エリア未設定"}
                                </Typography>
                              </Box>
                            </Stack>

                            <Stack
                              direction="row"
                              spacing={1}
                              useFlexGap
                              sx={{
                                alignItems: "center",
                                flexWrap: "wrap",
                              }}
                            >
                              <Chip
                                label={`MATCH ${candidate.matchScore ?? 0}`}
                                color="primary"
                                sx={{
                                  fontWeight: 800,
                                }}
                              />

                              <Chip
                                label={getCandidateFacilityStatusLabel(
                                  candidate.status,
                                )}
                                color={getCandidateFacilityStatusColor(
                                  candidate.status,
                                )}
                                variant="outlined"
                                sx={{
                                  fontWeight: 700,
                                }}
                              />
                            </Stack>
                          </Box>

                          {/* 施設情報 */}
                          <Box
                            sx={{
                              display: "grid",
                              gridTemplateColumns: {
                                xs: "1fr",
                                md: "repeat(2, minmax(0, 1fr))",
                              },
                              gap: 2,
                            }}
                          >
                            <Box
                              sx={{
                                p: 2,
                                borderRadius: 3,
                                bgcolor: "background.default",
                              }}
                            >
                              <Typography
                                variant="caption"
                                color="text.secondary"
                              >
                                🏠 住所
                              </Typography>

                              <Typography
                                variant="body2"
                                sx={{
                                  mt: 0.5,
                                  fontWeight: 600,
                                }}
                              >
                                {candidate.facility?.address ?? "未設定"}
                              </Typography>
                            </Box>

                            <Box
                              sx={{
                                p: 2,
                                borderRadius: 3,
                                bgcolor: "background.default",
                              }}
                            >
                              <Typography
                                variant="caption"
                                color="text.secondary"
                              >
                                ☎️ 電話番号
                              </Typography>

                              <Typography
                                variant="body2"
                                sx={{
                                  mt: 0.5,
                                  fontWeight: 600,
                                }}
                              >
                                {candidate.facility?.phone ?? "未設定"}
                              </Typography>
                            </Box>
                          </Box>

                          {/* 候補施設メモ */}
                          {candidate.note && (
                            <Box
                              sx={{
                                p: 2,
                                borderRadius: 3,
                                bgcolor: "secondary.light",
                              }}
                            >
                              <Typography
                                variant="caption"
                                color="text.secondary"
                              >
                                📝 メモ
                              </Typography>

                              <Typography
                                variant="body2"
                                sx={{
                                  mt: 0.5,
                                  whiteSpace: "pre-wrap",
                                }}
                              >
                                {candidate.note}
                              </Typography>
                            </Box>
                          )}

                          {/* アクション */}
                          {candidate.facility && (
                            <Box
                              sx={{
                                display: "flex",
                                justifyContent: {
                                  xs: "stretch",
                                  sm: "flex-end",
                                },
                              }}
                            >
                              <Stack
                                direction={{
                                  xs: "column",
                                  sm: "row",
                                }}
                                spacing={1}
                                sx={{
                                  width: {
                                    xs: "100%",
                                    sm: "auto",
                                  },
                                }}
                              >
                                <Button
                                  variant="outlined"
                                  onClick={() => {
                                    navigate(
                                      `/facilities/${candidate.facility!.facilityId}`,
                                    );
                                  }}
                                >
                                  施設詳細を見る
                                </Button>

                                {candidate.activeInquiryId ? (
                                  <Button
                                    variant="contained"
                                    onClick={() => {
                                      navigate(
                                        `/inquiries/${candidate.activeInquiryId}`,
                                      );
                                    }}
                                  >
                                    💬 問い合わせを見る
                                  </Button>
                                ) : (
                                  <Button
                                    variant="contained"
                                    onClick={() => {
                                      const searchParams = new URLSearchParams({
                                        placementCaseId,
                                        candidateFacilityId:
                                          candidate.candidateFacilityId,
                                      });

                                      navigate(
                                        `/facilities/${candidate.facility!.facilityId}/inquiry?${searchParams.toString()}`,
                                      );
                                    }}
                                  >
                                    💬 この施設に問い合わせる
                                  </Button>
                                )}
                              </Stack>
                            </Box>
                          )}
                        </Stack>
                      </CardContent>
                    </Card>
                  ))}
                </Stack>
              )}
            </Stack>
          </CardContent>
        </Card>
      </Stack>
    </Container>
  );
}
