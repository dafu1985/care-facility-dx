import {
  Alert,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControlLabel,
  MenuItem,
  Stack,
  Switch,
  TextField,
} from "@mui/material";
import { useState } from "react";

import { updateFacilityRequirement } from "../api/update-facility-requirement";
import type { FacilityRequirement } from "../types/facility";

interface RequirementEditDialogProps {
  open: boolean;

  facilityId: string;

  requirement: FacilityRequirement | null;

  onClose: () => void;

  onUpdated: () => void;
}

interface RequirementEditFormProps {
  facilityId: string;

  requirement: FacilityRequirement | null;

  onClose: () => void;

  onUpdated: () => void;
}

/**
 * 受入条件編集フォーム。
 */
function RequirementEditForm({
  facilityId,
  requirement,
  onClose,
  onUpdated,
}: RequirementEditFormProps) {
  const [minCareLevel, setMinCareLevel] = useState(
    requirement?.minCareLevel !== null &&
      requirement?.minCareLevel !== undefined
      ? String(requirement.minCareLevel)
      : "1",
  );

  const [maxCareLevel, setMaxCareLevel] = useState(
    requirement?.maxCareLevel !== null &&
      requirement?.maxCareLevel !== undefined
      ? String(requirement.maxCareLevel)
      : "5",
  );

  const [dementiaAccepted, setDementiaAccepted] = useState(
    requirement?.dementiaAccepted ?? false,
  );

  const [medicalCareAccepted, setMedicalCareAccepted] = useState(
    requirement?.medicalCareAccepted ?? false,
  );

  const [wheelchairAccepted, setWheelchairAccepted] = useState(
    requirement?.wheelchairAccepted ?? false,
  );

  const [endOfLifeCare, setEndOfLifeCare] = useState(
    requirement?.endOfLifeCare ?? false,
  );

  const [note, setNote] = useState(requirement?.note ?? "");

  const [isSaving, setIsSaving] = useState(false);

  const [error, setError] = useState<string | null>(null);

  /**
   * 受入条件を保存する。
   */
  const handleSave = async () => {
    try {
      setIsSaving(true);
      setError(null);

      const min = Number(minCareLevel);

      const max = Number(maxCareLevel);

      /**
       * 要介護度は1〜5。
       */
      if (min < 1 || min > 5 || max < 1 || max > 5) {
        setError("要介護度は1〜5の範囲で指定してください。");

        return;
      }

      /**
       * 下限 > 上限を禁止する。
       */
      if (min > max) {
        setError("要介護度の下限は上限以下にしてください。");

        return;
      }

      await updateFacilityRequirement(facilityId, {
        minCareLevel: min,
        maxCareLevel: max,
        dementiaAccepted,
        medicalCareAccepted,
        wheelchairAccepted,
        endOfLifeCare,
        note: note === "" ? null : note,
      });

      onUpdated();

      onClose();
    } catch (error) {
      console.error("受入条件の更新に失敗しました。", error);

      setError("受入条件の更新に失敗しました。");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <>
      <DialogContent>
        <Stack
          spacing={2}
          sx={{
            mt: 1,
          }}
        >
          {error && <Alert severity="error">{error}</Alert>}

          <TextField
            select
            label="要介護度（下限）"
            value={minCareLevel}
            onChange={(event) => setMinCareLevel(event.target.value)}
            fullWidth
          >
            {[1, 2, 3, 4, 5].map((level) => (
              <MenuItem key={level} value={String(level)}>
                要介護{level}
              </MenuItem>
            ))}
          </TextField>

          <TextField
            select
            label="要介護度（上限）"
            value={maxCareLevel}
            onChange={(event) => setMaxCareLevel(event.target.value)}
            fullWidth
          >
            {[1, 2, 3, 4, 5].map((level) => (
              <MenuItem key={level} value={String(level)}>
                要介護{level}
              </MenuItem>
            ))}
          </TextField>

          <FormControlLabel
            control={
              <Switch
                checked={dementiaAccepted}
                onChange={(event) => setDementiaAccepted(event.target.checked)}
              />
            }
            label="認知症対応可"
          />

          <FormControlLabel
            control={
              <Switch
                checked={medicalCareAccepted}
                onChange={(event) =>
                  setMedicalCareAccepted(event.target.checked)
                }
              />
            }
            label="医療ケア対応可"
          />

          <FormControlLabel
            control={
              <Switch
                checked={wheelchairAccepted}
                onChange={(event) =>
                  setWheelchairAccepted(event.target.checked)
                }
              />
            }
            label="車椅子対応可"
          />

          <FormControlLabel
            control={
              <Switch
                checked={endOfLifeCare}
                onChange={(event) => setEndOfLifeCare(event.target.checked)}
              />
            }
            label="看取り対応可"
          />

          <TextField
            label="備考"
            value={note}
            onChange={(event) => setNote(event.target.value)}
            multiline
            minRows={3}
            fullWidth
          />
        </Stack>
      </DialogContent>

      <DialogActions>
        <Button onClick={onClose} disabled={isSaving}>
          キャンセル
        </Button>

        <Button
          variant="contained"
          onClick={() => {
            void handleSave();
          }}
          disabled={isSaving}
        >
          {isSaving ? "保存中..." : "保存"}
        </Button>
      </DialogActions>
    </>
  );
}

/**
 * 受入条件編集ダイアログ。
 */
export function RequirementEditDialog({
  open,
  facilityId,
  requirement,
  onClose,
  onUpdated,
}: RequirementEditDialogProps) {
  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>受入条件を編集</DialogTitle>

      {open && (
        <RequirementEditForm
          facilityId={facilityId}
          requirement={requirement}
          onClose={onClose}
          onUpdated={onUpdated}
        />
      )}
    </Dialog>
  );
}
