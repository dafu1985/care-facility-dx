import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Container,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  Stack,
  Switch,
  TextField,
  Typography,
} from "@mui/material";
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import { getCaseMedicalRequirements } from "../api/get-case-medical-requirements";
import { getMedicalConditions } from "../api/get-medical-conditions";
import { replaceCaseMedicalRequirements } from "../api/replace-case-medical-requirements";

import type {
  MedicalCondition,
  MedicalRequirementLevel,
} from "../types/case-medical-requirement";

/**
 * 画面上で管理する医療条件1件分の入力状態。
 */
interface MedicalRequirementFormItem {
  medicalCondition: MedicalCondition;
  enabled: boolean;
  requirementLevel: MedicalRequirementLevel;
  note: string;
}

/**
 * 医療条件の登録・編集画面。
 */
export function MedicalRequirementsEditPage() {
  const navigate = useNavigate();
  const { placementCaseId } = useParams<{ placementCaseId: string }>();

  const [items, setItems] = useState<MedicalRequirementFormItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /**
   * 医療条件マスタと、案件に登録済みの医療条件を取得する。
   *
   * マスタを基準にフォームを生成し、
   * 登録済み条件があれば初期値として反映する。
   */
  useEffect(() => {
    if (!placementCaseId) {
      setError("案件IDを取得できませんでした。");
      setIsLoading(false);
      return;
    }

    let cancelled = false;

    Promise.all([
      getMedicalConditions(),
      getCaseMedicalRequirements(placementCaseId),
    ])
      .then(([medicalConditions, requirements]) => {
        if (cancelled) {
          return;
        }

        const requirementMap = new Map(
          requirements.map((requirement) => [
            requirement.medicalCondition.code,
            requirement,
          ]),
        );

        const formItems = medicalConditions.map((medicalCondition) => {
          const requirement = requirementMap.get(medicalCondition.code);

          return {
            medicalCondition,
            enabled: Boolean(requirement),
            requirementLevel: requirement?.requirementLevel ?? "REQUIRED",
            note: requirement?.note ?? "",
          } satisfies MedicalRequirementFormItem;
        });

        setItems(formItems);
      })
      .catch((error) => {
        if (cancelled) {
          return;
        }

        console.error("医療条件の取得に失敗しました。", error);
        setError("医療条件の取得に失敗しました。");
      })
      .finally(() => {
        if (!cancelled) {
          setIsLoading(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [placementCaseId]);

  /**
   * 指定した医療条件の入力状態を部分更新する。
   */
  function updateItem(
    code: string,
    updates: Partial<
      Pick<MedicalRequirementFormItem, "enabled" | "requirementLevel" | "note">
    >,
  ) {
    setItems((currentItems) =>
      currentItems.map((item) =>
        item.medicalCondition.code === code
          ? {
              ...item,
              ...updates,
            }
          : item,
      ),
    );
  }

  /**
   * 選択された医療条件を保存する。
   */
  async function handleSubmit() {
    if (!placementCaseId || isSubmitting) {
      return;
    }

    const enabledItems = items.filter((item) => item.enabled);

    if (enabledItems.length === 0) {
      setError("医療条件を1件以上選択してください。");
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      await replaceCaseMedicalRequirements(
        placementCaseId,
        enabledItems.map((item) => ({
          code: item.medicalCondition.code,
          requirementLevel: item.requirementLevel,
          note: item.note.trim() || undefined,
        })),
      );

      navigate(`/placement-cases/${placementCaseId}`, {
        replace: true,
      });
    } catch (error) {
      console.error("医療条件の保存に失敗しました。", error);
      setError(
        "医療条件の保存に失敗しました。入力内容を確認して再度お試しください。",
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  if (isLoading) {
    return (
      <Container maxWidth="md" sx={{ py: 4 }}>
        <Typography>読み込み中...</Typography>
      </Container>
    );
  }

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Stack spacing={3}>
        <Box>
          {/* 案件詳細への戻る導線 */}
          <Button
            variant="text"
            onClick={() => {
              navigate(`/placement-cases/${placementCaseId}`);
            }}
            sx={{
              mb: 2,
              px: 0,
              minWidth: 0,
              color: "text.secondary",
              fontWeight: 700,
              "&:hover": {
                bgcolor: "transparent",
                color: "primary.main",
              },
            }}
          >
            ← 案件詳細へ戻る
          </Button>

          {/* ページHero */}
          <Box
            sx={{
              position: "relative",
              overflow: "hidden",
              borderRadius: 4,
              p: {
                xs: 3,
                md: 4,
              },
              background:
                "linear-gradient(135deg, #EEF2FF 0%, #FFF1EC 55%, #E8F7F5 100%)",
            }}
          >
            {/* 背景の装飾 */}
            <Box
              sx={{
                position: "absolute",
                top: -50,
                right: -30,
                width: 160,
                height: 160,
                borderRadius: "50%",
                bgcolor: "rgba(255, 255, 255, 0.55)",
              }}
            />

            <Stack
              direction={{
                xs: "column",
                sm: "row",
              }}
              spacing={2}
              sx={{
                position: "relative",
                alignItems: {
                  xs: "flex-start",
                  sm: "center",
                },
              }}
            >
              {/* アイコン */}
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  width: 56,
                  height: 56,
                  borderRadius: 3,
                  bgcolor: "rgba(255, 255, 255, 0.8)",
                  fontSize: 28,
                  boxShadow: "0 8px 24px rgba(99, 102, 241, 0.12)",
                  flexShrink: 0,
                }}
              >
                🏥
              </Box>

              {/* タイトル */}
              <Box>
                <Typography
                  variant="overline"
                  sx={{
                    color: "primary.main",
                    fontWeight: 800,
                    letterSpacing: "0.12em",
                  }}
                >
                  MEDICAL REQUIREMENTS
                </Typography>

                <Typography
                  variant="h4"
                  component="h1"
                  sx={{
                    mt: 0.25,
                    fontWeight: 800,
                    letterSpacing: "-0.02em",
                  }}
                >
                  医療条件
                </Typography>

                <Typography
                  variant="body1"
                  color="text.secondary"
                  sx={{
                    mt: 1,
                    maxWidth: 620,
                  }}
                >
                  施設マッチングで考慮する医療条件を選択してください。
                </Typography>
              </Box>
            </Stack>
          </Box>
        </Box>

        {error && <Alert severity="error">{error}</Alert>}

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
            🩺 医療条件の選択
          </Typography>

          <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
            必要な医療対応を有効にし、重要度や補足情報を設定してください。
          </Typography>
        </Box>

        <Stack spacing={2}>
          {items.map((item) => (
            <Card
              key={item.medicalCondition.medicalConditionId}
              sx={{
                border: "1px solid",
                borderColor: item.enabled ? "primary.light" : "divider",
                borderRadius: 3,
                bgcolor: item.enabled ? "#FAFAFF" : "background.paper",
                boxShadow: item.enabled
                  ? "0 8px 24px rgba(99, 102, 241, 0.08)"
                  : "0 4px 16px rgba(15, 23, 42, 0.03)",
                transition: "all 0.2s ease",
                "&:hover": {
                  borderColor: "primary.light",
                  boxShadow: "0 10px 28px rgba(99, 102, 241, 0.10)",
                },
              }}
            >
              <CardContent
                sx={{
                  p: {
                    xs: 2,
                    md: 3,
                  },
                  "&:last-child": {
                    pb: {
                      xs: 2,
                      md: 3,
                    },
                  },
                }}
              >
                <Stack spacing={2}>
                  <Box
                    sx={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      gap: 2,
                    }}
                  >
                    <Box sx={{ minWidth: 0 }}>
                      <Stack
                        direction="row"
                        spacing={1}
                        sx={{
                          alignItems: "center",
                          flexWrap: "wrap",
                          rowGap: 1,
                        }}
                      >
                        <Typography
                          variant="subtitle1"
                          sx={{
                            fontWeight: 800,
                            color: item.enabled
                              ? "primary.main"
                              : "text.primary",
                          }}
                        >
                          🩺 {item.medicalCondition.name}
                        </Typography>

                        <Box
                          sx={{
                            px: 1.25,
                            py: 0.35,
                            borderRadius: 2,
                            bgcolor: item.enabled ? "#E8F7F5" : "#F1F5F9",
                            color: item.enabled ? "#00897B" : "text.secondary",
                            fontSize: 12,
                            fontWeight: 800,
                            whiteSpace: "nowrap",
                          }}
                        >
                          {item.enabled ? "選択中" : "未選択"}
                        </Box>
                      </Stack>

                      <Typography
                        variant="caption"
                        color="text.secondary"
                        sx={{ display: "block", mt: 0.5 }}
                      >
                        {item.medicalCondition.code}
                      </Typography>
                    </Box>

                    <Switch
                      checked={item.enabled}
                      onChange={(event) => {
                        updateItem(item.medicalCondition.code, {
                          enabled: event.target.checked,
                        });
                      }}
                      slotProps={{
                        input: {
                          "aria-label": `${item.medicalCondition.name}を使用する`,
                        },
                      }}
                    />
                  </Box>

                  {item.enabled && (
                    <Box
                      sx={{
                        mt: 1,
                        p: {
                          xs: 2,
                          md: 2.5,
                        },
                        borderRadius: 2.5,
                        bgcolor: "background.paper",
                        border: "1px solid",
                        borderColor: "divider",
                        display: "flex",
                        flexDirection: "column",
                        gap: 2,
                      }}
                    >
                      <Typography
                        variant="body2"
                        sx={{
                          fontWeight: 800,
                          color: "text.secondary",
                        }}
                      >
                        ⚙️ 対応条件の詳細
                      </Typography>

                      <FormControl fullWidth>
                        <InputLabel
                          id={`${item.medicalCondition.code}-requirement-level-label`}
                        >
                          重要度
                        </InputLabel>

                        <Select
                          labelId={`${item.medicalCondition.code}-requirement-level-label`}
                          value={item.requirementLevel}
                          label="重要度"
                          onChange={(event) => {
                            updateItem(item.medicalCondition.code, {
                              requirementLevel: event.target
                                .value as MedicalRequirementLevel,
                            });
                          }}
                        >
                          <MenuItem value="REQUIRED">必須</MenuItem>
                          <MenuItem value="PREFERRED">希望</MenuItem>
                        </Select>
                      </FormControl>

                      <TextField
                        label="補足メモ"
                        value={item.note}
                        onChange={(event) => {
                          updateItem(item.medicalCondition.code, {
                            note: event.target.value,
                          });
                        }}
                        multiline
                        minRows={2}
                        slotProps={{
                          htmlInput: {
                            maxLength: 1000,
                          },
                        }}
                        placeholder="例：朝夕2回の対応が必要"
                        fullWidth
                      />
                    </Box>
                  )}
                </Stack>
              </CardContent>
            </Card>
          ))}
        </Stack>

        <Box
          sx={{
            display: "flex",
            flexDirection: {
              xs: "column-reverse",
              sm: "row",
            },
            justifyContent: "flex-end",
            gap: 1.5,
            pt: 1,
          }}
        >
          <Button
            variant="outlined"
            disabled={isSubmitting}
            onClick={() => {
              navigate(`/placement-cases/${placementCaseId}`);
            }}
            sx={{
              minWidth: {
                sm: 120,
              },
              minHeight: 46,
              fontWeight: 700,
            }}
          >
            キャンセル
          </Button>

          <Button
            variant="contained"
            disabled={isSubmitting || !placementCaseId}
            onClick={() => {
              void handleSubmit();
            }}
            sx={{
              minWidth: {
                sm: 180,
              },
              minHeight: 46,
              fontWeight: 800,
              boxShadow: "0 8px 20px rgba(99, 102, 241, 0.22)",
              "&:hover": {
                boxShadow: "0 10px 24px rgba(99, 102, 241, 0.28)",
              },
            }}
          >
            {isSubmitting ? "保存中..." : "✓ 医療条件を保存"}
          </Button>
        </Box>
      </Stack>
    </Container>
  );
}
