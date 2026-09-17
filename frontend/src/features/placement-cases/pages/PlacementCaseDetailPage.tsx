import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  CircularProgress,
  Container,
  Divider,
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
 * boolean値を「あり・なし」で表示する。
 */
function getBooleanLabel(value: boolean): string {
  return value ? "あり" : "なし";
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
        {/* 戻るボタン */}
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
              {placementCase.caseCode}
            </Typography>

            <Typography
              variant="body2"
              color="text.secondary"
              sx={{
                mt: 0.5,
              }}
            >
              施設探し案件の詳細
            </Typography>
          </Box>

          <Chip
            label={getPlacementCaseStatusLabel(placementCase.status)}
            color={getPlacementCaseStatusColor(placementCase.status)}
          />
        </Box>

        {/* 案件基本情報 */}
        <Card>
          <CardContent>
            <Stack spacing={2}>
              <Typography variant="h6">案件基本情報</Typography>

              <Divider />

              <Stack spacing={1.5}>
                <Typography>
                  <strong>案件コード：</strong>
                  {placementCase.caseCode}
                </Typography>

                <Typography>
                  <strong>ステータス：</strong>
                  {getPlacementCaseStatusLabel(placementCase.status)}
                </Typography>

                <Typography>
                  <strong>入居希望日：</strong>
                  {formatDate(placementCase.desiredMoveInDate)}
                </Typography>

                <Typography>
                  <strong>緊急度：</strong>
                  {getUrgencyLabel(placementCase.urgency)}
                </Typography>

                <Typography>
                  <strong>メモ：</strong>
                  {placementCase.note ?? "未設定"}
                </Typography>

                <Typography variant="body2" color="text.secondary">
                  作成日：
                  {formatDate(placementCase.createdAt)}
                </Typography>

                <Typography variant="body2" color="text.secondary">
                  最終更新：
                  {formatDate(placementCase.updatedAt)}
                </Typography>
              </Stack>
            </Stack>
          </CardContent>
        </Card>

        {/* 利用者条件 */}
        <Card>
          <CardContent>
            <Stack spacing={2}>
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  gap: 2,
                }}
              >
                <Typography variant="h6">利用者条件</Typography>

                <Button
                  variant="outlined"
                  size="small"
                  onClick={() => {
                    navigate(
                      `/placement-cases/${placementCaseId}/conditions`,
                    );
                  }}
                >
                  {clientCondition ? "利用者条件を編集" : "利用者条件を登録"}
                </Button>
              </Box>

              <Divider />

              {!clientCondition ? (
                <Alert severity="warning">
                  利用者条件が登録されていません。
                </Alert>
              ) : (
                <Box
                  sx={{
                    display: "grid",
                    gridTemplateColumns: {
                      xs: "1fr",
                      sm: "repeat(2, 1fr)",
                    },
                    gap: 2,
                  }}
                >
                  <Typography>
                    <strong>年代：</strong>
                    {getAgeGroupLabel(clientCondition.ageGroup)}
                  </Typography>

                  <Typography>
                    <strong>性別：</strong>
                    {getGenderLabel(clientCondition.gender)}
                  </Typography>

                  <Typography>
                    <strong>要介護度：</strong>
                    {getCareLevelLabel(clientCondition.careLevel)}
                  </Typography>

                  <Typography>
                    <strong>月額予算上限：</strong>
                    {formatCurrency(clientCondition.budgetMax)}
                  </Typography>

                  <Typography>
                    <strong>希望地域：</strong>
                    {clientCondition.desiredArea ?? "未設定"}
                  </Typography>

                  <Typography>
                    <strong>生活保護：</strong>
                    {getBooleanLabel(clientCondition.publicAssistance)}
                  </Typography>

                  <Typography>
                    <strong>身元保証人：</strong>
                    {getBooleanLabel(clientCondition.guarantorAvailable)}
                  </Typography>

                  <Typography>
                    <strong>認知症：</strong>
                    {getBooleanLabel(clientCondition.dementia)}
                  </Typography>

                  <Typography>
                    <strong>看取り希望：</strong>
                    {getBooleanLabel(clientCondition.endOfLifeCare)}
                  </Typography>

                  <Typography>
                    <strong>入居希望日：</strong>
                    {formatDate(clientCondition.desiredMoveInDate)}
                  </Typography>
                </Box>
              )}
            </Stack>
          </CardContent>
        </Card>

        {/* 医療条件 */}
        <Card>
          <CardContent>
            <Stack spacing={2}>
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  gap: 2,
                }}
              >
                <Typography variant="h6">医療条件</Typography>

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
                    : "医療条件を編集"}
                </Button>
              </Box>

              <Divider />

              {medicalRequirements.length === 0 ? (
                <Alert severity="info">医療条件は登録されていません。</Alert>
              ) : (
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
                        gap: 1,
                        py: 1,
                      }}
                    >
                      <Box>
                        <Typography sx={{ fontWeight: 600 }}>
                          {requirement.medicalCondition.name}
                        </Typography>

                        {requirement.note && (
                          <Typography variant="body2" color="text.secondary">
                            {requirement.note}
                          </Typography>
                        )}
                      </Box>

                      <Chip
                        size="small"
                        label={getMedicalRequirementLevelLabel(
                          requirement.requirementLevel,
                        )}
                        color={getMedicalRequirementLevelColor(
                          requirement.requirementLevel,
                        )}
                      />
                    </Box>
                  ))}
                </Stack>
              )}
            </Stack>
          </CardContent>
        </Card>

        {/* マッチング */}
        <Card>
          <CardContent>
            <Stack spacing={2}>
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
                <Box>
                  <Typography variant="h6">候補施設</Typography>

                  <Typography
                    variant="body2"
                    color="text.secondary"
                    sx={{
                      mt: 0.5,
                    }}
                  >
                    登録した条件をもとに候補施設を検索します。
                  </Typography>
                </Box>

                <Button
                  variant="contained"
                  disabled={isMatching}
                  onClick={() => {
                    void handleRunMatching();
                  }}
                >
                  {isMatching ? "検索中..." : "施設を検索"}
                </Button>
              </Box>

              <Divider />

              {matchingError && <Alert severity="error">{matchingError}</Alert>}

              {matchingMessage && (
                <Alert
                  severity={candidateFacilities.length > 0 ? "success" : "info"}
                >
                  {matchingMessage}
                </Alert>
              )}

              {isMatching && (
                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "center",
                    py: 3,
                  }}
                >
                  <CircularProgress size={32} />
                </Box>
              )}

              {!isMatching && candidateFacilities.length === 0 && (
                <Alert severity="info">
                  候補施設はまだありません。「施設を検索」を押してマッチングを実行してください。
                </Alert>
              )}

              {!isMatching && candidateFacilities.length > 0 && (
                <Stack spacing={2}>
                  {candidateFacilities.map((candidate) => (
                    <Card
                      key={candidate.candidateFacilityId}
                      variant="outlined"
                    >
                      <CardContent>
                        <Stack spacing={2}>
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
                            <Box>
                              <Typography variant="h6" component="h3">
                                {candidate.facility?.name ?? "施設名不明"}
                              </Typography>

                              <Typography
                                variant="body2"
                                color="text.secondary"
                              >
                                {candidate.facility?.area ?? "エリア未設定"}
                              </Typography>
                            </Box>

                            <Stack
                              direction="row"
                              spacing={1}
                              sx={{
                                alignItems: "center",
                              }}
                            >
                              <Chip
                                label={`マッチスコア ${candidate.matchScore ?? 0}`}
                                color="primary"
                              />

                              <Chip
                                label={getCandidateFacilityStatusLabel(
                                  candidate.status,
                                )}
                                color={getCandidateFacilityStatusColor(
                                  candidate.status,
                                )}
                                variant="outlined"
                              />
                            </Stack>
                          </Box>

                          <Divider />

                          <Stack spacing={1}>
                            <Typography>
                              <strong>住所：</strong>
                              {candidate.facility?.address ?? "未設定"}
                            </Typography>

                            <Typography>
                              <strong>電話番号：</strong>
                              {candidate.facility?.phone ?? "未設定"}
                            </Typography>

                            {candidate.note && (
                              <Typography>
                                <strong>メモ：</strong>
                                {candidate.note}
                              </Typography>
                            )}
                          </Stack>

                          {candidate.facility && (
                            <Stack
                              direction={{
                                xs: "column",
                                sm: "row",
                              }}
                              spacing={1}
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
                                  問い合わせを見る
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
                                  この施設に問い合わせる
                                </Button>
                              )}
                            </Stack>
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
