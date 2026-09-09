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

import { updateFacility } from "../api/update-facility";
import type { Facility } from "../types/facility";

interface FacilityEditDialogProps {
  open: boolean;

  facilityId: string;

  facility: Facility;

  onClose: () => void;

  onUpdated: () => void;
}

interface FacilityEditFormProps {
  facilityId: string;

  facility: Facility;

  onClose: () => void;

  onUpdated: () => void;
}

/**
 * 施設基本情報編集フォーム。
 */
function FacilityEditForm({
  facilityId,
  facility,
  onClose,
  onUpdated,
}: FacilityEditFormProps) {
  const [name, setName] = useState(facility.name);

  const [postalCode, setPostalCode] = useState(facility.postalCode ?? "");

  const [address, setAddress] = useState(facility.address ?? "");

  const [area, setArea] = useState(facility.area);

  const [phone, setPhone] = useState(facility.phone ?? "");

  const [description, setDescription] = useState(facility.description ?? "");

  const [isSaving, setIsSaving] = useState(false);

  const [error, setError] = useState<string | null>(null);

  /**
   * 施設基本情報を保存する。
   */
  const handleSave = async () => {
    try {
      setIsSaving(true);
      setError(null);

      /**
       * 必須項目チェック。
       */
      if (name.trim() === "") {
        setError("施設名を入力してください。");

        return;
      }

      if (area.trim() === "") {
        setError("エリアを入力してください。");

        return;
      }

      await updateFacility(facilityId, {
        name: name.trim(),

        postalCode: postalCode.trim() === "" ? null : postalCode.trim(),

        address: address.trim() === "" ? null : address.trim(),

        area: area.trim(),

        phone: phone.trim() === "" ? null : phone.trim(),

        description: description.trim() === "" ? null : description.trim(),
      });

      onUpdated();

      onClose();
    } catch (error) {
      console.error("施設基本情報の更新に失敗しました。", error);

      setError("施設基本情報の更新に失敗しました。");
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
            label="施設名"
            value={name}
            onChange={(event) => setName(event.target.value)}
            required
            fullWidth
          />

          <TextField
            label="郵便番号"
            value={postalCode}
            onChange={(event) => setPostalCode(event.target.value)}
            placeholder="950-0000"
            fullWidth
          />

          <TextField
            label="住所"
            value={address}
            onChange={(event) => setAddress(event.target.value)}
            fullWidth
          />

          <TextField
            label="エリア"
            value={area}
            onChange={(event) => setArea(event.target.value)}
            required
            fullWidth
          />

          <TextField
            label="電話番号"
            value={phone}
            onChange={(event) => setPhone(event.target.value)}
            placeholder="025-000-0000"
            fullWidth
          />

          <TextField
            label="施設説明"
            value={description}
            onChange={(event) => setDescription(event.target.value)}
            multiline
            minRows={4}
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
 * 施設基本情報編集ダイアログ。
 */
export function FacilityEditDialog({
  open,
  facilityId,
  facility,
  onClose,
  onUpdated,
}: FacilityEditDialogProps) {
  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>施設基本情報を編集</DialogTitle>

      {open && (
        <FacilityEditForm
          facilityId={facilityId}
          facility={facility}
          onClose={onClose}
          onUpdated={onUpdated}
        />
      )}
    </Dialog>
  );
}
