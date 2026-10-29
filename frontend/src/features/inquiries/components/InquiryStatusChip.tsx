import { Chip } from "@mui/material";
import type { InquiryStatus } from "../types/inquiry";
import { getStatusLabel } from "../utils/inquiry-status";

type InquiryStatusChipProps = {
  status: InquiryStatus;
};

/**
 * 問い合わせステータスを色付きChipで表示する。
 */
export function InquiryStatusChip({ status }: InquiryStatusChipProps) {
  return (
    <Chip
      label={getStatusLabel(status)}
      size="medium"
      sx={{
        fontWeight: 800,
        borderRadius: 2,
        bgcolor:
          status === "OPEN"
            ? "#FEF3C7"
            : status === "IN_PROGRESS"
              ? "#DBEAFE"
              : status === "ANSWERED"
                ? "#D1FAE5"
                : status === "CANCELLED"
                  ? "#FEE2E2"
                  : "#F1F5F9",
        color:
          status === "OPEN"
            ? "#92400E"
            : status === "IN_PROGRESS"
              ? "#1D4ED8"
              : status === "ANSWERED"
                ? "#065F46"
                : status === "CANCELLED"
                  ? "#991B1B"
                  : "#475569",
      }}
    />
  );
}
