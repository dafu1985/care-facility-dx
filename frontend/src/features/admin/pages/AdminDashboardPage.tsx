import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

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

import { getAdminDashboard } from "../api/get-admin-dashboard";
import type { AdminDashboardResponse } from "../types/admin-dashboard";

const managementMenus = [
  {
    title: "施設管理",
    description: "登録施設の確認・承認・利用停止を管理します。",
    icon: "🏢",
  },
  {
    title: "ユーザー管理",
    description: "ケアマネジャー・施設職員のアカウントを管理します。",
    icon: "👥",
  },
  {
    title: "問い合わせ管理",
    description: "施設への問い合わせと対応状況を管理します。",
    icon: "💬",
  },
];

export function AdminDashboardPage() {
  const navigate = useNavigate();
  const [dashboard, setDashboard] = useState<AdminDashboardResponse | null>(
    null,
  );

  const [isLoading, setIsLoading] = useState(true);

  const [error, setError] = useState<string | null>(null);

  /**
   * 初回表示時に管理者ダッシュボード情報を取得する。
   */
  useEffect(() => {
    let cancelled = false;

    getAdminDashboard()
      .then((response) => {
        if (cancelled) {
          return;
        }

        setDashboard(response);
        setError(null);
      })
      .catch((error: unknown) => {
        if (cancelled) {
          return;
        }

        console.error("管理者ダッシュボードの取得に失敗しました。", error);

        setError("管理者ダッシュボードの取得に失敗しました。");
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

  if (isLoading) {
    return (
      <Box
        sx={{
          minHeight: "50vh",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Alert severity="error">{error}</Alert>
      </Container>
    );
  }

  if (!dashboard) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Alert severity="warning">
          管理者ダッシュボード情報を取得できませんでした。
        </Alert>
      </Container>
    );
  }

  const summaryCards = [
    {
      title: "登録施設数",
      value: dashboard.facilityCount,
      unit: "施設",
      icon: "🏢",
      background: "primary.light",
    },
    {
      title: "ケアマネジャー数",
      value: dashboard.careManagerCount,
      unit: "人",
      icon: "👥",
      background: "secondary.light",
    },
    {
      title: "問い合わせ総数",
      value: dashboard.inquiryCount,
      unit: "件",
      icon: "💬",
      background: "info.light",
    },
    {
      title: "未対応問い合わせ",
      value: dashboard.openInquiryCount,
      unit: "件",
      icon: "🕐",
      background: "warning.light",
    },
  ] as const;

  return (
    <Container
      maxWidth="xl"
      sx={{
        py: { xs: 3, md: 4 },
      }}
    >
      <Stack spacing={3}>
        {/* ウェルカムエリア */}
        <Box
          sx={{
            p: { xs: 3, md: 4 },
            borderRadius: 5,
            background:
              "linear-gradient(135deg, #EEF2FF 0%, #F3E8FF 55%, #E8F7F5 100%)",
          }}
        >
          <Typography
            variant="body2"
            sx={{
              fontWeight: 700,
              color: "primary.main",
              mb: 1,
            }}
          >
            SYSTEM ADMINISTRATION
          </Typography>

          <Typography variant="h4" component="h1" gutterBottom>
            管理者ダッシュボード
          </Typography>

          <Typography color="text.secondary">
            Care Facility DXの施設・ユーザー・問い合わせを管理します。
          </Typography>
        </Box>

        {/* システム全体の集計情報 */}
        <Box>
          <Typography variant="h6" sx={{ mb: 2 }}>
            システム利用状況
          </Typography>

          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: {
                xs: "1fr",
                sm: "repeat(2, 1fr)",
                lg: "repeat(4, 1fr)",
              },
              gap: 2,
            }}
          >
            {summaryCards.map((item) => (
              <Card
                key={item.title}
                elevation={0}
                sx={{
                  bgcolor: item.background,
                  height: "100%",
                  borderRadius: 3,
                }}
              >
                <CardContent sx={{ p: 3 }}>
                  <Stack spacing={2}>
                    <Box
                      sx={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                      }}
                    >
                      <Typography
                        sx={{
                          fontWeight: 700,
                        }}
                      >
                        {item.title}
                      </Typography>

                      <Typography
                        sx={{
                          fontSize: 25,
                        }}
                      >
                        {item.icon}
                      </Typography>
                    </Box>

                    <Box>
                      <Typography
                        component="span"
                        sx={{
                          fontSize: "2.25rem",
                          fontWeight: 800,
                          lineHeight: 1,
                        }}
                      >
                        {item.value}
                      </Typography>

                      <Typography
                        component="span"
                        sx={{
                          ml: 1,
                          color: "text.secondary",
                        }}
                      >
                        {item.unit}
                      </Typography>
                    </Box>
                  </Stack>
                </CardContent>
              </Card>
            ))}
          </Box>
        </Box>

        {/* 管理メニュー */}
        <Box>
          <Typography variant="h6" sx={{ mb: 2 }}>
            管理メニュー
          </Typography>

          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: {
                xs: "1fr",
                md: "repeat(3, 1fr)",
              },
              gap: 3,
            }}
          >
            {managementMenus.map((menu) => (
              <Card key={menu.title} sx={{ height: "100%" }}>
                <CardContent sx={{ p: 3 }}>
                  <Stack spacing={2}>
                    <Typography
                      sx={{
                        fontSize: 30,
                      }}
                    >
                      {menu.icon}
                    </Typography>

                    <Typography variant="h6">{menu.title}</Typography>

                    <Typography color="text.secondary">
                      {menu.description}
                    </Typography>

                    {menu.title === "施設管理" ? (
                      <Button
                        variant="contained"
                        onClick={() => navigate("/admin/facilities")}
                      >
                        施設管理を開く
                      </Button>
                    ) : (
                      <Typography variant="body2" color="text.secondary">
                        管理機能は今後実装予定です。
                      </Typography>
                    )}
                  </Stack>
                </CardContent>
              </Card>
            ))}
          </Box>
        </Box>
      </Stack>
    </Container>
  );
}
