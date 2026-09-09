import {
  Alert,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  MenuItem,
  Stack,
  TextField,
} from "@mui/material";
import { useState } from "react";

import { updateFacilityAvailability } from "../api/update-facility-availability";
import type { FacilityAvailability } from "../types/facility";

interface AvailabilityEditDialogProps {
  open: boolean;

  facilityId: string;

  availability: FacilityAvailability | null;

  onClose: () => void;

  /**
   * 更新成功後に親画面へ通知する。
   */
  onUpdated: () => void;
}

interface AvailabilityEditFormProps {
  facilityId: string;

  availability: FacilityAvailability | null;

  onClose: () => void;

  onUpdated: () => void;
}

/**
 * 空き状況編集フォーム。
 *
 * ダイアログを開いたタイミングでマウントされるため、
 * useEffectでsetStateする必要がない。
 */
function AvailabilityEditForm({
  facilityId,
  availability,
  onClose,
  onUpdated,
}: AvailabilityEditFormProps) {
  /**
   * 現在の空き状況を初期値として設定する。
   */
  const [status, setStatus] = useState(availability?.status ?? "AVAILABLE");

  const [availableCount, setAvailableCount] = useState(
    availability?.availableCount !== null &&
      availability?.availableCount !== undefined
      ? String(availability.availableCount)
      : "",
  );

  const [availableFrom, setAvailableFrom] = useState(
    availability?.availableFrom ?? "",
  );

  const [note, setNote] = useState(availability?.note ?? "");

  const [isSaving, setIsSaving] = useState(false);

  const [error, setError] = useState<string | null>(null);

  /**
   * 空き状況を保存する。
   */
  const handleSave = async () => {
    try {
      setIsSaving(true);
      setError(null);

      /**
       * statusに応じて
       * availableCountを最終決定する。
       */
      const normalizedAvailableCount =
        status === "FULL"
          ? 0
          : status === "UNKNOWN"
            ? null
            : Number(availableCount);

      /**
       * AVAILABLE / FEWの場合は
       * 1床以上を必須とする。
       */
      if (
        (status === "AVAILABLE" || status === "FEW") &&
        (availableCount === "" || Number(availableCount) < 1)
      ) {
        setError(
          "空きあり・残りわずかの場合は、空き数を1床以上入力してください。",
        );

        return;
      }

      await updateFacilityAvailability(facilityId, {
        status,

        availableCount: normalizedAvailableCount,

        availableFrom: availableFrom === "" ? null : availableFrom,

        note: note === "" ? null : note,
      });

      /**
       * 親画面へ更新完了を通知する。
       *
       * Dashboardを再取得する。
       */
      onUpdated();

      onClose();
    } catch (error) {
      console.error("空き状況の更新に失敗しました。", error);

      setError("空き状況の更新に失敗しました。");
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

          {/* 空き状況 */}
          <TextField
            select
            label="空き状況"
            value={status}
            onChange={(event) => {
              const nextStatus = event.target.value;

              setStatus(nextStatus);

              /**
               * 空きなしなら0床。
               */
              if (nextStatus === "FULL") {
                setAvailableCount("0");
              }

              /**
               * 未確認なら空床数も未設定。
               */
              if (nextStatus === "UNKNOWN") {
                setAvailableCount("");
              }

              /**
               * AVAILABLE / FEWへ変更した際、
               * 0または未入力なら1床を初期値にする。
               */
              if (nextStatus === "AVAILABLE" || nextStatus === "FEW") {
                if (availableCount === "" || Number(availableCount) < 1) {
                  setAvailableCount("1");
                }
              }
            }}
            fullWidth
          >
            <MenuItem value="AVAILABLE">空きあり</MenuItem>

            <MenuItem value="FEW">残りわずか</MenuItem>

            <MenuItem value="FULL">空きなし</MenuItem>

            <MenuItem value="UNKNOWN">未確認</MenuItem>
          </TextField>

          {/* 空き数 */}
          <TextField
            label="空き数"
            type="number"
            value={availableCount}
            onChange={(event) => setAvailableCount(event.target.value)}
            disabled={status === "FULL" || status === "UNKNOWN"}
            helperText={
              status === "FULL"
                ? "空きなしの場合は0床になります。"
                : status === "UNKNOWN"
                  ? "未確認の場合は空き数を設定しません。"
                  : "1床以上を入力してください。"
            }
            slotProps={{
              htmlInput: {
                min: status === "AVAILABLE" || status === "FEW" ? 1 : 0,
              },
            }}
            fullWidth
          />

          {/* 入居可能日 */}
          <TextField
            label="入居可能日"
            type="date"
            value={availableFrom}
            onChange={(event) => setAvailableFrom(event.target.value)}
            slotProps={{
              inputLabel: {
                shrink: true,
              },
            }}
            fullWidth
          />

          {/* 備考 */}
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
 * 空き状況編集ダイアログ。
 */
export function AvailabilityEditDialog({
  open,
  facilityId,
  availability,
  onClose,
  onUpdated,
}: AvailabilityEditDialogProps) {
  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>空き状況を編集</DialogTitle>

      {/**
       * open=trueのときだけフォームを生成する。
       *
       * ダイアログを閉じるとフォームがアンマウントされるため、
       * 次回開いたときに最新availabilityから
       * useStateの初期値が再生成される。
       */}
      {open && (
        <AvailabilityEditForm
          facilityId={facilityId}
          availability={availability}
          onClose={onClose}
          onUpdated={onUpdated}
        />
      )}
    </Dialog>
  );
}
