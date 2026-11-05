import {
  Alert,
  Box,
  Button,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  MenuItem,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import { useEffect, useState } from "react";

import { getMedicalConditions } from "../../placement-cases/api/get-medical-conditions";
import type { MedicalCondition } from "../../placement-cases/types/case-medical-requirement";
import { getFacilityMedicalCapabilities } from "../api/get-facility-medical-capabilities";
import { replaceFacilityMedicalCapabilities } from "../api/replace-facility-medical-capabilities";
import type {
  FacilityMedicalCapabilityStatus,
  MedicalCapabilityInput,
} from "../types/facility-medical-capability";

interface MedicalCapabilitiesEditDialogProps {
  open: boolean;
  facilityId: string;
  onClose: () => void;
  onUpdated: () => void;
}

type CapabilityFormValue = {
  status: FacilityMedicalCapabilityStatus | "";
  note: string;
};

type CapabilityFormValues = Record<string, CapabilityFormValue>;

const statusOptions = [
  { value: "AVAILABLE", label: "対応可能" },
  { value: "CONSULTATION", label: "要相談" },
  { value: "UNAVAILABLE", label: "対応不可" },
] as const;

export function MedicalCapabilitiesEditDialog({
  open,
  facilityId,
  onClose,
  onUpdated,
}: MedicalCapabilitiesEditDialogProps) {
  const [conditions, setConditions] = useState<MedicalCondition[]>([]);
  const [formValues, setFormValues] = useState<CapabilityFormValues>({});
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!open) {
      return;
    }

    let cancelled = false;

    async function loadData() {
      try {
        const [masters, capabilities] = await Promise.all([
          getMedicalConditions(),
          getFacilityMedicalCapabilities(facilityId),
        ]);

        if (cancelled) {
          return;
        }

        const values: CapabilityFormValues = {};

        for (const condition of masters) {
          const existing = capabilities.find(
            (item) => item.medicalConditionId === condition.medicalConditionId,
          );

          values[condition.code] = {
            status: existing?.status ?? "",
            note: existing?.note ?? "",
          };
        }

        setConditions(masters);
        setFormValues(values);
        setError(null);
      } catch (err) {
        if (!cancelled) {
          console.error("医療対応情報の取得に失敗しました。", err);
          setError("医療対応情報の取得に失敗しました。");
        }
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    }

    // ダイアログを開くたびに最新情報を取得する。
    // Reactのeffect内で直接setStateを呼ばない構成にする。
    void Promise.resolve().then(() => {
      if (!cancelled) {
        setIsLoading(true);
        setError(null);
        void loadData();
      }
    });

    return () => {
      cancelled = true;
    };
  }, [open, facilityId]);

  const updateValue = (
    code: string,
    field: keyof CapabilityFormValue,
    value: string,
  ) => {
    setFormValues((current) => ({
      ...current,
      [code]: {
        ...current[code],
        status: current[code]?.status ?? "",
        note: current[code]?.note ?? "",
        [field]: value,
      },
    }));

    // 入力内容を修正したら、前回のエラーを解除する。
    setError(null);
  };

  const handleSave = async () => {
    const capabilities: MedicalCapabilityInput[] = conditions.flatMap(
      (condition) => {
        const value = formValues[condition.code];

        if (!value?.status) {
          return [];
        }

        return [
          {
            code: condition.code,
            status: value.status,
            note: value.note.trim() || null,
          },
        ];
      },
    );

    if (capabilities.length === 0) {
      setError("少なくとも1つの医療条件の対応状況を設定してください。");
      return;
    }

    if (capabilities.some((item) => (item.note?.length ?? 0) > 1000)) {
      setError("補足メモは1000文字以内で入力してください。");
      return;
    }

    try {
      setIsSaving(true);
      setError(null);

      await replaceFacilityMedicalCapabilities(facilityId, {
        capabilities,
      });

      onUpdated();
      onClose();
    } catch (err) {
      console.error("医療対応情報の保存に失敗しました。", err);
      setError("医療対応情報の保存に失敗しました。");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Dialog
      open={open}
      onClose={isSaving ? undefined : onClose}
      fullWidth
      maxWidth="md"
    >
      <DialogTitle>医療対応情報を編集</DialogTitle>

      <DialogContent dividers>
        {isLoading ? (
          <Box sx={{ display: "flex", justifyContent: "center", py: 5 }}>
            <CircularProgress />
          </Box>
        ) : (
          <Stack spacing={3} sx={{ mt: 1 }}>
            {error && <Alert severity="error">{error}</Alert>}

            <Typography variant="body2" color="text.secondary">
              医療条件ごとに対応状況を選択してください。
              未設定の項目は保存対象から除外されます。
            </Typography>

            {conditions.map((condition) => {
              const value = formValues[condition.code] ?? {
                status: "",
                note: "",
              };

              return (
                <Box
                  key={condition.medicalConditionId}
                  sx={{
                    p: 2,
                    border: 1,
                    borderColor: "divider",
                    borderRadius: 1,
                  }}
                >
                  <Stack spacing={2}>
                    <Typography sx={{ fontWeight: 700 }}>
                      {condition.name}
                    </Typography>

                    <TextField
                      select
                      label="対応状況"
                      value={value.status}
                      onChange={(event) =>
                        updateValue(
                          condition.code,
                          "status",
                          event.target.value,
                        )
                      }
                      fullWidth
                      disabled={isSaving}
                    >
                      <MenuItem value="">未設定</MenuItem>

                      {statusOptions.map((option) => (
                        <MenuItem key={option.value} value={option.value}>
                          {option.label}
                        </MenuItem>
                      ))}
                    </TextField>

                    <TextField
                      label="補足メモ"
                      value={value.note}
                      onChange={(event) =>
                        updateValue(condition.code, "note", event.target.value)
                      }
                      multiline
                      minRows={2}
                      fullWidth
                      disabled={isSaving || value.status === ""}
                      slotProps={{
                        htmlInput: {
                          maxLength: 1000,
                        },
                      }}
                    />
                  </Stack>
                </Box>
              );
            })}

            {conditions.length === 0 && !error && (
              <Alert severity="info">利用可能な医療条件がありません。</Alert>
            )}
          </Stack>
        )}
      </DialogContent>

      <DialogActions>
        <Button onClick={onClose} disabled={isSaving}>
          キャンセル
        </Button>

        <Button
          variant="contained"
          onClick={() => void handleSave()}
          disabled={isLoading || isSaving || conditions.length === 0}
        >
          {isSaving ? "保存中..." : "保存"}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
