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
            requirementLevel:
              requirement?.requirementLevel ?? "REQUIRED",
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
      Pick<
        MedicalRequirementFormItem,
        "enabled" | "requirementLevel" | "note"
      >
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
          <Typography variant="h5" component="h1">
            医療条件
          </Typography>

          <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
            施設マッチングで考慮する医療条件を選択してください。
          </Typography>
        </Box>

        {error && <Alert severity="error">{error}</Alert>}

        <Stack spacing={2}>
          {items.map((item) => (
            <Card key={item.medicalCondition.medicalConditionId}>
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
                    <Box>
                      <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                        {item.medicalCondition.name}
                      </Typography>

                      <Typography variant="caption" color="text.secondary">
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
                    <>
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
                    </>
                  )}
                </Stack>
              </CardContent>
            </Card>
          ))}
        </Stack>

        <Box
          sx={{
            display: "flex",
            justifyContent: "flex-end",
            gap: 2,
          }}
        >
          <Button
            variant="outlined"
            disabled={isSubmitting}
            onClick={() => {
              navigate(`/placement-cases/${placementCaseId}`);
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
          >
            {isSubmitting ? "保存中..." : "医療条件を保存"}
          </Button>
        </Box>
      </Stack>
    </Container>
  );
}