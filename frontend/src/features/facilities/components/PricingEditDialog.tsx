import {
  Alert,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Stack,
  TextField,
} from "@mui/material";
import { useState } from "react";

import { updateFacilityPricing } from "../api/update-facility-pricing";
import type { FacilityPricing } from "../types/facility";

interface PricingEditDialogProps {
  open: boolean;

  facilityId: string;

  pricing: FacilityPricing | null;

  onClose: () => void;

  onUpdated: () => void;
}

interface PricingEditFormProps {
  facilityId: string;

  pricing: FacilityPricing | null;

  onClose: () => void;

  onUpdated: () => void;
}

/**
 * 料金情報編集フォーム。
 */
function PricingEditForm({
  facilityId,
  pricing,
  onClose,
  onUpdated,
}: PricingEditFormProps) {
  const [monthlyCostMin, setMonthlyCostMin] = useState(
    pricing?.monthlyCostMin !== null && pricing?.monthlyCostMin !== undefined
      ? String(pricing.monthlyCostMin)
      : "",
  );

  const [monthlyCostMax, setMonthlyCostMax] = useState(
    pricing?.monthlyCostMax !== null && pricing?.monthlyCostMax !== undefined
      ? String(pricing.monthlyCostMax)
      : "",
  );

  const [entranceFee, setEntranceFee] = useState(
    pricing?.entranceFee !== null && pricing?.entranceFee !== undefined
      ? String(pricing.entranceFee)
      : "0",
  );

  const [note, setNote] = useState(pricing?.note ?? "");

  const [isSaving, setIsSaving] = useState(false);

  const [error, setError] = useState<string | null>(null);

  /**
   * 料金情報を保存する。
   */
  const handleSave = async () => {
    try {
      setIsSaving(true);
      setError(null);

      const min = Number(monthlyCostMin);

      const max = Number(monthlyCostMax);

      const fee = Number(entranceFee);

      /**
       * 必須値チェック。
       */
      if (monthlyCostMin === "" || monthlyCostMax === "") {
        setError("月額料金の下限・上限を入力してください。");

        return;
      }

      /**
       * 負数を禁止する。
       */
      if (min < 0 || max < 0 || fee < 0) {
        setError("料金は0円以上で入力してください。");

        return;
      }

      /**
       * 下限 > 上限を禁止する。
       */
      if (min > max) {
        setError("月額料金の下限は上限以下にしてください。");

        return;
      }

      await updateFacilityPricing(facilityId, {
        monthlyCostMin: min,
        monthlyCostMax: max,
        entranceFee: fee,
        note: note === "" ? null : note,
      });

      onUpdated();

      onClose();
    } catch (error) {
      console.error("料金情報の更新に失敗しました。", error);

      setError("料金情報の更新に失敗しました。");
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
            label="月額料金（下限）"
            type="number"
            value={monthlyCostMin}
            onChange={(event) => setMonthlyCostMin(event.target.value)}
            slotProps={{
              htmlInput: {
                min: 0,
              },
            }}
            fullWidth
          />

          <TextField
            label="月額料金（上限）"
            type="number"
            value={monthlyCostMax}
            onChange={(event) => setMonthlyCostMax(event.target.value)}
            slotProps={{
              htmlInput: {
                min: 0,
              },
            }}
            fullWidth
          />

          <TextField
            label="入居一時金"
            type="number"
            value={entranceFee}
            onChange={(event) => setEntranceFee(event.target.value)}
            slotProps={{
              htmlInput: {
                min: 0,
              },
            }}
            fullWidth
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
 * 料金情報編集ダイアログ。
 */
export function PricingEditDialog({
  open,
  facilityId,
  pricing,
  onClose,
  onUpdated,
}: PricingEditDialogProps) {
  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>料金情報を編集</DialogTitle>

      {open && (
        <PricingEditForm
          facilityId={facilityId}
          pricing={pricing}
          onClose={onClose}
          onUpdated={onUpdated}
        />
      )}
    </Dialog>
  );
}
