import { Box, Button, Container, Paper, Stack } from "@mui/material";
import { useLocation, useNavigate } from "react-router-dom";

/**
 * ログイン後の共通ナビゲーション。
 *
 * アプリの主要機能への導線を提供し、
 * 現在表示している機能を視覚的に分かりやすくする。
 */
export function AppNavigation() {
  const navigate = useNavigate();
  const location = useLocation();

  /**
   * 現在表示している機能に対応する
   * ナビゲーション項目かどうかを判定する。
   */
  function isActive(path: string) {
    if (path === "/") {
      return location.pathname === "/";
    }

    return location.pathname.startsWith(path);
  }

  /**
   * 共通ナビゲーション項目。
   */
  const navigationItems = [
    {
      label: "ホーム",
      path: "/",
      icon: "🏠",
    },
    {
      label: "施設探し案件",
      path: "/placement-cases",
      icon: "📋",
    },
    {
      label: "施設検索",
      path: "/facilities",
      icon: "🔍",
    },
    {
      label: "問い合わせ",
      path: "/inquiries",
      icon: "💬",
    },
  ];

  return (
    <Box
      component="nav"
      sx={{
        pt: {
          xs: 1.5,
          md: 2,
        },
      }}
    >
      <Container maxWidth="xl">
        <Paper
          elevation={0}
          sx={{
            p: {
              xs: 0.75,
              md: 1,
            },
            borderRadius: 4,
            border: 1,
            borderColor: "divider",
            bgcolor: "rgba(255, 255, 255, 0.92)",
          }}
        >
          <Stack
            direction="row"
            spacing={1}
            useFlexGap
            sx={{
              flexWrap: "wrap",
            }}
          >
            {navigationItems.map((item) => {
              const active = isActive(item.path);

              return (
                <Button
                  key={item.path}
                  onClick={() => navigate(item.path)}
                  variant="text"
                  sx={{
                    minHeight: {
                      xs: 44,
                      md: 48,
                    },
                    px: {
                      xs: 1.5,
                      md: 2.5,
                    },
                    borderRadius: 3,
                    fontSize: {
                      xs: "0.82rem",
                      md: "0.9rem",
                    },
                    fontWeight: 700,

                    bgcolor: active ? "primary.main" : "transparent",

                    color: active ? "primary.contrastText" : "text.secondary",

                    boxShadow: active
                      ? "0 5px 14px rgba(99, 102, 241, 0.20)"
                      : "none",

                    transition:
                      "background-color 0.2s ease, color 0.2s ease, transform 0.2s ease, box-shadow 0.2s ease",

                    "&:hover": {
                      bgcolor: active ? "primary.dark" : "primary.light",

                      color: active ? "primary.contrastText" : "primary.dark",

                      transform: "translateY(-1px)",
                    },
                  }}
                >
                  <Box
                    component="span"
                    sx={{
                      mr: {
                        xs: 0.75,
                        md: 1,
                      },
                      fontSize: {
                        xs: 17,
                        md: 20,
                      },
                      lineHeight: 1,
                    }}
                  >
                    {item.icon}
                  </Box>

                  {item.label}
                </Button>
              );
            })}
          </Stack>
        </Paper>
      </Container>
    </Box>
  );
}
