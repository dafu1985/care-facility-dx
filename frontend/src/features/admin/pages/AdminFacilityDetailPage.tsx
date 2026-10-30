import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import {
  Alert,
  Box,
  Button,
  Chip,
  CircularProgress,
  Container,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Divider,
  Paper,
  Stack,
  Typography,
} from "@mui/material";

import { getAdminFacility } from "../api/get-admin-facility";
import { updateAdminFacilityStatus } from "../api/update-admin-facility-status";

import type {
  AdminFacility,
  AdminFacilityStatus,
} from "../types/admin-facility";

/**
 * 管理者向け施設詳細画面。
 *
 * ADMIN権限で施設の詳細情報を表示する。
 * 施設の利用停止・再開を行う。
 */
export function AdminFacilityDetailPage() {
  const { facilityId } = useParams<{ facilityId: string }>();
  const navigate = useNavigate();

  const [facility, setFacility] = useState<AdminFacility | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  /**
   * 施設詳細情報を取得する。
   */
  useEffect(() => {
    if (!facilityId) {
      return;
    }

    let cancelled = false;

    getAdminFacility(facilityId)
      .then((response) => {
        if (cancelled) {
          return;
        }

        setFacility(response);
        setError(null);
      })
      .catch((error: unknown) => {
        if (cancelled) {
          return;
        }

        console.error("施設詳細の取得に失敗しました。", error);

        setError("施設詳細の取得に失敗しました。");
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
  }, [facilityId]);

  /**
   * 施設の利用ステータスを変更する。
   *
   * ACTIVE -> INACTIVE
   * INACTIVE -> ACTIVE
   */
  async function handleUpdateStatus() {
    if (!facility || !facilityId || isUpdating) {
      return;
    }

    const nextStatus: AdminFacilityStatus =
      facility.status === "ACTIVE" ? "INACTIVE" : "ACTIVE";

    setIsUpdating(true);
    setError(null);
    setSuccess(null);

    try {
      const updatedFacility = await updateAdminFacilityStatus(
        facilityId,
        nextStatus,
      );

      setFacility(updatedFacility);
      setDialogOpen(false);

      setSuccess(
        nextStatus === "ACTIVE"
          ? "施設の利用を再開しました。"
          : "施設の利用を停止しました。",
      );
    } catch (error: unknown) {
      console.error("施設ステータスの変更に失敗しました。", error);

      setError("施設ステータスの変更に失敗しました。");
    } finally {
      setIsUpdating(false);
    }
  }

  /**
   * 施設IDが存在しない場合。
   */
  if (!facilityId) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Stack spacing={2}>
          <Alert severity="error">施設IDが指定されていません。</Alert>

          <Button onClick={() => navigate("/admin/facilities")}>
            施設一覧へ戻る
          </Button>
        </Stack>
      </Container>
    );
  }

  /**
   * 施設情報の読み込み中。
   */
  if (isLoading) {
    return (
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          minHeight: "50vh",
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  /**
   * 施設情報を取得できなかった場合。
   */
  if (!facility) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Stack spacing={2}>
          <Alert severity="error">
            {error ?? "施設情報を取得できませんでした。"}
          </Alert>

          <Button onClick={() => navigate("/admin/facilities")}>
            施設一覧へ戻る
          </Button>
        </Stack>
      </Container>
    );
  }

  const isActive = facility.status === "ACTIVE";

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Stack spacing={3}>
        {/* ヘッダー */}
        <Box>
          <Button onClick={() => navigate("/admin/facilities")}>
            ← 施設一覧へ戻る
          </Button>

          <Typography variant="h4" component="h1" sx={{ mt: 2 }}>
            施設詳細
          </Typography>
        </Box>

        {/* エラー・成功メッセージ */}
        {error && <Alert severity="error">{error}</Alert>}

        {success && <Alert severity="success">{success}</Alert>}

        {/* 施設基本情報 */}
        <Paper sx={{ p: { xs: 3, md: 4 } }}>
          <Stack spacing={3}>
            <Stack
              direction={{ xs: "column", sm: "row" }}
              spacing={2}
              sx={{
                justifyContent: "space-between",
                alignItems: {
                  xs: "flex-start",
                  sm: "center",
                },
              }}
            >
              <Typography variant="h5">{facility.name}</Typography>

              <Chip
                label={isActive ? "利用中" : "利用停止"}
                color={isActive ? "success" : "default"}
              />
            </Stack>

            <Divider />

            {/* 施設情報 */}
            <Stack spacing={2}>
              <Typography>
                <strong>施設種別：</strong>
                {facility.facilityType?.name ?? "未設定"}
              </Typography>

              <Typography>
                <strong>エリア：</strong>
                {facility.area}
              </Typography>

              <Typography>
                <strong>郵便番号：</strong>
                {facility.postalCode ?? "未設定"}
              </Typography>

              <Typography>
                <strong>所在地：</strong>
                {facility.address ?? "未設定"}
              </Typography>

              <Typography>
                <strong>電話番号：</strong>
                {facility.phone ?? "未設定"}
              </Typography>

              <Typography>
                <strong>施設説明：</strong>
                {facility.description ?? "未設定"}
              </Typography>
            </Stack>

            <Divider />

            {/* ステータス管理 */}
            <Box>
              <Typography variant="h6" gutterBottom>
                利用ステータス管理
              </Typography>

              <Typography color="text.secondary" sx={{ mb: 2 }}>
                利用停止にすると、施設は一般向けの検索結果から
                非表示になります。
              </Typography>

              <Button
                variant="contained"
                color={isActive ? "error" : "success"}
                disabled={isUpdating}
                onClick={() => setDialogOpen(true)}
              >
                {isActive ? "施設の利用を停止する" : "施設の利用を再開する"}
              </Button>
            </Box>
          </Stack>
        </Paper>
      </Stack>

      {/* ステータス変更確認ダイアログ */}
      <Dialog
        open={dialogOpen}
        onClose={() => {
          if (!isUpdating) {
            setDialogOpen(false);
          }
        }}
      >
        <DialogTitle>
          {isActive ? "施設の利用停止" : "施設の利用再開"}
        </DialogTitle>

        <DialogContent>
          <DialogContentText>
            {facility.name} の利用を
            {isActive ? "停止" : "再開"}します。 よろしいですか？
          </DialogContentText>
        </DialogContent>

        <DialogActions>
          <Button onClick={() => setDialogOpen(false)} disabled={isUpdating}>
            キャンセル
          </Button>

          <Button
            variant="contained"
            color={isActive ? "error" : "success"}
            onClick={handleUpdateStatus}
            disabled={isUpdating}
          >
            {isUpdating ? "更新中..." : "確定する"}
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
}
