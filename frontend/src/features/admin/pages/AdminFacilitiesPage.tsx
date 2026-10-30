import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import {
  Alert,
  Box,
  Button,
  Chip,
  CircularProgress,
  Container,
  Paper,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
} from "@mui/material";

import { getAdminFacilities } from "../api/get-admin-facilities";
import type { AdminFacility } from "../types/admin-facility";

/**
 * 管理者向け施設一覧画面。
 *
 * ADMIN権限で登録施設を一覧表示する。
 * ACTIVE / INACTIVEの両方を表示する。
 */
export function AdminFacilitiesPage() {
  const navigate = useNavigate();

  const [facilities, setFacilities] = useState<AdminFacility[]>([]);
  const [total, setTotal] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  /**
   * 初回表示時に管理者向け施設一覧を取得する。
   */
  useEffect(() => {
    let cancelled = false;

    getAdminFacilities()
      .then((response) => {
        if (cancelled) {
          return;
        }

        setFacilities(response.items);
        setTotal(response.total);
        setError(null);
      })
      .catch((error: unknown) => {
        if (cancelled) {
          return;
        }

        console.error("施設一覧の取得に失敗しました。", error);

        setError("施設一覧の取得に失敗しました。");
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
  }, []);

  /**
   * 施設詳細画面へ遷移する。
   */
  const handleOpenDetail = (facilityId: string) => {
    navigate(`/admin/facilities/${facilityId}`);
  };

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      <Stack spacing={3}>
        {/* ヘッダー */}
        <Box>
          <Button onClick={() => navigate("/")}>← ダッシュボードへ戻る</Button>

          <Typography variant="h4" component="h1" sx={{ mt: 2 }}>
            施設管理
          </Typography>

          <Typography color="text.secondary" sx={{ mt: 1 }}>
            登録施設の一覧と利用ステータスを確認できます。
          </Typography>
        </Box>

        {/* エラー表示 */}
        {error && <Alert severity="error">{error}</Alert>}

        {/* 読み込み中 */}
        {isLoading ? (
          <Box
            sx={{
              display: "flex",
              justifyContent: "center",
              py: 8,
            }}
          >
            <CircularProgress />
          </Box>
        ) : error ? null : (
          <Stack spacing={2}>
            {/* 登録施設数 */}
            <Typography variant="subtitle1">登録施設数：{total}件</Typography>

            {/* 施設一覧 */}
            <TableContainer component={Paper}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>施設名</TableCell>
                    <TableCell>施設種別</TableCell>
                    <TableCell>エリア</TableCell>
                    <TableCell>所在地</TableCell>
                    <TableCell>ステータス</TableCell>
                    <TableCell align="center">操作</TableCell>
                  </TableRow>
                </TableHead>

                <TableBody>
                  {facilities.map((facility) => (
                    <TableRow key={facility.facilityId} hover>
                      {/* 施設名 */}
                      <TableCell>
                        <Typography sx={{ fontWeight: 600 }}>
                          {facility.name}
                        </Typography>
                      </TableCell>

                      {/* 施設種別 */}
                      <TableCell>
                        {facility.facilityType?.name ?? "未設定"}
                      </TableCell>

                      {/* エリア */}
                      <TableCell>{facility.area}</TableCell>

                      {/* 所在地 */}
                      <TableCell>{facility.address ?? "未設定"}</TableCell>

                      {/* 利用ステータス */}
                      <TableCell>
                        <Chip
                          label={
                            facility.status === "ACTIVE" ? "利用中" : "利用停止"
                          }
                          color={
                            facility.status === "ACTIVE" ? "success" : "default"
                          }
                          size="small"
                        />
                      </TableCell>

                      {/* 操作 */}
                      <TableCell align="center">
                        <Button
                          size="small"
                          variant="outlined"
                          onClick={() => handleOpenDetail(facility.facilityId)}
                        >
                          詳細
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}

                  {/* 登録施設が0件の場合 */}
                  {facilities.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={6} align="center">
                        登録施設がありません。
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          </Stack>
        )}
      </Stack>
    </Container>
  );
}
