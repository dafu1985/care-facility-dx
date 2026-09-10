import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  CircularProgress,
  Container,
  Stack,
  Typography,
} from "@mui/material";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import { removeAccessToken } from "../../auth/utils/token-storage";

import { getCareManagerDashboard } from "../api/get-care-manager-dashboard";

import type { CareManagerDashboardResponse } from "../types/care-manager-dashboard";

/**
 * ケアマネジャー向けダッシュボード画面。
 *
 * ケアマネジャー情報、
 * 問い合わせ状況、
 * 最近の問い合わせを表示する。
 */
export function CareManagerDashboardPage() {
  /**
   * 画面遷移用。
   */
  const navigate = useNavigate();

  /**
   * ダッシュボード情報。
   */
  const [dashboard, setDashboard] =
    useState<CareManagerDashboardResponse | null>(null);

  /**
   * 読み込み状態。
   */
  const [isLoading, setIsLoading] = useState(true);

  /**
   * APIエラー。
   */
  const [error, setError] = useState<string | null>(null);

  /**
   * ログアウト処理。
   *
   * 保存されているJWTを削除して、
   * ログイン画面へ遷移する。
   */
  const handleLogout = () => {
    removeAccessToken();

    navigate("/login", {
      replace: true,
    });
  };

  /**
   * 初回表示時に
   * ケアマネジャーダッシュボード情報を取得する。
   */
  useEffect(() => {
    let cancelled = false;

    getCareManagerDashboard()
      .then((response) => {
        if (cancelled) {
          return;
        }

        setDashboard(response);
        setError(null);
      })
      .catch((error) => {
        if (cancelled) {
          return;
        }

        console.error(
          "ケアマネジャーダッシュボードの取得に失敗しました。",
          error,
        );

        setError("ケアマネジャーダッシュボードの取得に失敗しました。");
      })
      .finally(() => {
        if (cancelled) {
          return;
        }

        setIsLoading(false);
      });

    /**
     * コンポーネント破棄後に
     * state更新を行わないようにする。
     */
    return () => {
      cancelled = true;
    };
  }, []);

  /**
   * 読み込み中。
   */
  if (isLoading) {
    return (
      <Box
        sx={{
          minHeight: "100vh",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  /**
   * API取得失敗。
   */
  if (error) {
    return (
      <Container
        maxWidth="lg"
        sx={{
          py: 4,
        }}
      >
        <Alert severity="error">{error}</Alert>
      </Container>
    );
  }

  /**
   * ダッシュボード情報が存在しない場合。
   */
  if (!dashboard) {
    return (
      <Container
        maxWidth="lg"
        sx={{
          py: 4,
        }}
      >
        <Alert severity="warning">
          ケアマネジャー情報を取得できませんでした。
        </Alert>
      </Container>
    );
  }

  const { careManager, inquirySummary } = dashboard;

  return (
    <Container
      maxWidth="lg"
      sx={{
        py: 4,
      }}
    >
      <Stack spacing={3}>
        {/* ヘッダー */}
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            gap: 2,
          }}
        >
          <Typography variant="h5" component="h1">
            ケアマネジャーダッシュボード
          </Typography>

          <Button variant="outlined" onClick={handleLogout}>
            ログアウト
          </Button>
        </Box>

        {/* ケアマネジャー基本情報 */}
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              ケアマネジャー情報
            </Typography>

            <Stack spacing={1}>
              <Typography>
                所属事業所：
                {careManager.organizationName}
              </Typography>

              <Typography>
                資格番号：
                {careManager.licenseNumber ?? "未登録"}
              </Typography>
            </Stack>
          </CardContent>
        </Card>

        {/* 問い合わせサマリー */}
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              問い合わせ状況
            </Typography>

            <Box
              sx={{
                display: "grid",
                gridTemplateColumns: {
                  xs: "1fr",
                  sm: "repeat(3, 1fr)",
                },
                gap: 2,
                mt: 2,
              }}
            >
              <Card variant="outlined">
                <CardContent>
                  <Typography color="text.secondary" gutterBottom>
                    全問い合わせ
                  </Typography>

                  <Typography variant="h4">
                    {inquirySummary.totalCount}
                    <Typography
                      component="span"
                      sx={{
                        ml: 0.5,
                      }}
                    >
                      件
                    </Typography>
                  </Typography>
                </CardContent>
              </Card>

              <Card variant="outlined">
                <CardContent>
                  <Typography color="text.secondary" gutterBottom>
                    対応中
                  </Typography>

                  <Typography variant="h4">
                    {inquirySummary.openCount}
                    <Typography
                      component="span"
                      sx={{
                        ml: 0.5,
                      }}
                    >
                      件
                    </Typography>
                  </Typography>
                </CardContent>
              </Card>

              <Card variant="outlined">
                <CardContent>
                  <Typography color="text.secondary" gutterBottom>
                    回答済み
                  </Typography>

                  <Typography variant="h4">
                    {inquirySummary.answeredCount}
                    <Typography
                      component="span"
                      sx={{
                        ml: 0.5,
                      }}
                    >
                      件
                    </Typography>
                  </Typography>
                </CardContent>
              </Card>
            </Box>

            <Button
              variant="outlined"
              onClick={() => {
                navigate("/inquiries");
              }}
              sx={{
                mt: 2,
              }}
            >
              問い合わせ一覧を見る
            </Button>
          </CardContent>
        </Card>

        {/* 最近の問い合わせ */}
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              最近の問い合わせ
            </Typography>

            {inquirySummary.recentInquiries.length === 0 ? (
              <Typography color="text.secondary">
                問い合わせはありません。
              </Typography>
            ) : (
              <Stack spacing={2}>
                {inquirySummary.recentInquiries.map((inquiry) => (
                  <Box
                    key={inquiry.inquiryId}
                    sx={{
                      p: 2,
                      border: 1,
                      borderColor: "divider",
                      borderRadius: 1,
                    }}
                  >
                    <Typography
                      sx={{
                        fontWeight: 700,
                      }}
                    >
                      {inquiry.subject}
                    </Typography>

                    <Typography variant="body2" color="text.secondary">
                      施設：
                      {inquiry.facilityName}
                    </Typography>

                    <Typography variant="body2" color="text.secondary">
                      ステータス：
                      {inquiry.status}
                    </Typography>

                    <Button
                      size="small"
                      onClick={() => {
                        navigate(`/inquiries/${inquiry.inquiryId}`);
                      }}
                      sx={{
                        mt: 1,
                      }}
                    >
                      詳細を見る
                    </Button>
                  </Box>
                ))}
              </Stack>
            )}
          </CardContent>
        </Card>

        {/* 施設検索 */}
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              施設を探す
            </Typography>

            <Typography
              color="text.secondary"
              sx={{
                mb: 2,
              }}
            >
              空床状況や受け入れ条件から施設を検索できます。
            </Typography>

            <Button
              variant="contained"
              onClick={() => {
                navigate("/facilities");
              }}
            >
              施設を検索する
            </Button>
          </CardContent>
        </Card>
      </Stack>
    </Container>
  );
}
