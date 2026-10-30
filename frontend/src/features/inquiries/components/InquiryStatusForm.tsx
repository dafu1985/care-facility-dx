import { Button, MenuItem, Stack, TextField, Typography } from "@mui/material";

import type { InquiryStatus } from "../types/inquiry";

type UserRole = "CARE_MANAGER" | "FACILITY" | "ADMIN";

type InquiryStatusFormProps = {
  status: InquiryStatus;
  currentStatus: InquiryStatus;
  role: UserRole;
  onStatusChange: (status: InquiryStatus) => void;
  onUpdateStatus: () => void;
  isUpdatingStatus: boolean;
};

const STATUS_LABELS: Record<InquiryStatus, string> = {
  OPEN: "未対応",
  IN_PROGRESS: "対応中",
  ANSWERED: "回答済み",
  CLOSED: "完了",
  CANCELLED: "キャンセル",
};

const ALL_STATUSES: InquiryStatus[] = [
  "OPEN",
  "IN_PROGRESS",
  "ANSWERED",
  "CLOSED",
  "CANCELLED",
];

/**
 * バックエンドの assertStatusTransition() と同じ遷移ルール。
 */
function getAllowedStatuses(
  currentStatus: InquiryStatus,
  role: UserRole,
): InquiryStatus[] {
  if (role === "ADMIN") {
    return ALL_STATUSES;
  }

  if (role === "FACILITY") {
    if (currentStatus === "OPEN") {
      return ["IN_PROGRESS"];
    }

    if (currentStatus === "IN_PROGRESS") {
      return ["ANSWERED"];
    }

    return [];
  }

  if (role === "CARE_MANAGER") {
    if (currentStatus === "ANSWERED") {
      return ["CLOSED", "CANCELLED"];
    }

    if (currentStatus === "OPEN" || currentStatus === "IN_PROGRESS") {
      return ["CANCELLED"];
    }
  }

  return [];
}

/**
 * 問い合わせステータス変更フォーム。
 */
export function InquiryStatusForm({
  status,
  currentStatus,
  role,
  onStatusChange,
  onUpdateStatus,
  isUpdatingStatus,
}: InquiryStatusFormProps) {
  const allowedStatuses = getAllowedStatuses(currentStatus, role);

  const options = [currentStatus, ...allowedStatuses].filter(
    (value, index, array) => array.indexOf(value) === index,
  );

  const canUpdate =
    status !== currentStatus &&
    allowedStatuses.includes(status) &&
    !isUpdatingStatus;

  if (allowedStatuses.length === 0) {
    return (
      <Typography variant="body2" color="text.secondary">
        現在のステータスでは変更可能な操作はありません。
      </Typography>
    );
  }

  return (
    <Stack
      direction={{ xs: "column", sm: "row" }}
      spacing={2}
      sx={{
        alignItems: { xs: "stretch", sm: "center" },
      }}
    >
      <TextField
        select
        label="ステータス"
        value={options.includes(status) ? status : currentStatus}
        onChange={(event) =>
          onStatusChange(event.target.value as InquiryStatus)
        }
        disabled={isUpdatingStatus}
        fullWidth
        size="small"
        sx={{
          bgcolor: "background.paper",
          "& .MuiOutlinedInput-root": {
            borderRadius: 2,
          },
        }}
      >
        {options.map((option) => (
          <MenuItem key={option} value={option}>
            {STATUS_LABELS[option]}
          </MenuItem>
        ))}
      </TextField>

      <Button
        variant="contained"
        onClick={onUpdateStatus}
        disabled={!canUpdate}
        sx={{
          minWidth: { xs: "100%", sm: 160 },
          minHeight: 40,
          borderRadius: 2,
          fontWeight: 800,
          textTransform: "none",
          boxShadow: "none",
          bgcolor: "#6366F1",
          "&:hover": {
            bgcolor: "#4F46E5",
            boxShadow: "none",
          },
        }}
      >
        {isUpdatingStatus ? "更新中..." : "ステータス更新"}
      </Button>
    </Stack>
  );
}
