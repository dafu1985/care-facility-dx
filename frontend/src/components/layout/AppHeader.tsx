import {
  AppBar,
  Badge,
  Box,
  Button,
  Container,
  Toolbar,
  Typography,
} from "@mui/material";
import { useNavigate } from "react-router-dom";

import { removeAccessToken } from "../../features/auth/utils/token-storage";

interface AppHeaderProps {
  /**
   * 問い合わせの未読メッセージ件数。
   */
  unreadCount: number;
}

/**
 * ログイン後の画面で共通表示するアプリケーションヘッダー。
 *
 * アプリのブランド表示、
 * 問い合わせ通知、
 * ログアウト機能を提供する。
 */
export function AppHeader({ unreadCount }: AppHeaderProps) {
  const navigate = useNavigate();

  /**
   * 保存されているJWTを削除し、
   * ログイン画面へ戻る。
   */
  function handleLogout() {
    removeAccessToken();

    navigate("/login", {
      replace: true,
    });
  }

  return (
    <AppBar
      position="sticky"
      elevation={0}
      sx={{
        bgcolor: "rgba(255, 255, 255, 0.96)",
        color: "text.primary",
        borderBottom: 1,
        borderColor: "divider",
        backdropFilter: "blur(12px)",
      }}
    >
      <Container maxWidth="xl">
        <Toolbar
          disableGutters
          sx={{
            minHeight: {
              xs: 72,
              md: 84,
            },
            gap: {
              xs: 1,
              md: 2,
            },
          }}
        >
          {/* アプリブランド */}
          <Box
            role="button"
            tabIndex={0}
            onClick={() => navigate("/")}
            onKeyDown={(event) => {
              if (event.key === "Enter" || event.key === " ") {
                event.preventDefault();
                navigate("/");
              }
            }}
            sx={{
              display: "flex",
              alignItems: "center",
              gap: {
                xs: 1.25,
                md: 1.75,
              },
              minWidth: 0,
              cursor: "pointer",
              borderRadius: 3,

              "&:focus-visible": {
                outline: "2px solid",
                outlineColor: "primary.main",
                outlineOffset: 4,
              },
            }}
          >
            {/* ロゴ */}
            <Box
              sx={{
                width: {
                  xs: 44,
                  md: 52,
                },
                height: {
                  xs: 44,
                  md: 52,
                },
                flexShrink: 0,
                display: "grid",
                placeItems: "center",
                borderRadius: {
                  xs: "14px",
                  md: "16px",
                },
                background: "linear-gradient(135deg, #EEF2FF 0%, #FFF1EC 100%)",
                border: "1px solid",
                borderColor: "divider",
                fontSize: {
                  xs: 23,
                  md: 27,
                },
              }}
            >
              🏠
            </Box>

            {/* アプリ名 */}
            <Box
              sx={{
                minWidth: 0,
              }}
            >
              <Typography
                component="div"
                sx={{
                  color: "primary.dark",
                  fontSize: {
                    xs: "1rem",
                    md: "1.2rem",
                  },
                  fontWeight: 800,
                  lineHeight: 1.25,
                  letterSpacing: "-0.01em",
                }}
              >
                Care Facility DX
              </Typography>

              <Typography
                color="text.secondary"
                sx={{
                  display: {
                    xs: "none",
                    sm: "block",
                  },
                  mt: 0.35,
                  fontSize: {
                    sm: "0.72rem",
                    md: "0.78rem",
                  },
                }}
              >
                施設探しを、もっとスムーズに。
              </Typography>
            </Box>
          </Box>

          {/* 左右を分離 */}
          <Box sx={{ flexGrow: 1 }} />

          {/* Header右側 */}
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              gap: {
                xs: 1,
                md: 1.5,
              },
              flexShrink: 0,
            }}
          >
            {/* 問い合わせ */}
            <Badge
              badgeContent={unreadCount}
              color="error"
              max={99}
              invisible={unreadCount === 0}
              overlap="rectangular"
            >
              <Button
                variant={unreadCount > 0 ? "contained" : "text"}
                color="primary"
                onClick={() => {
                  navigate("/inquiries");
                }}
                sx={{
                  minHeight: 42,
                  px: {
                    xs: 1.25,
                    sm: 2,
                  },
                  borderRadius: 3,
                  boxShadow:
                    unreadCount > 0
                      ? "0 5px 14px rgba(99, 102, 241, 0.18)"
                      : "none",

                  "&:hover": {
                    boxShadow:
                      unreadCount > 0
                        ? "0 7px 18px rgba(99, 102, 241, 0.24)"
                        : "none",
                  },
                }}
              >
                <Box
                  component="span"
                  sx={{
                    mr: {
                      xs: 0,
                      sm: 0.75,
                    },
                    fontSize: 17,
                    lineHeight: 1,
                  }}
                >
                  💬
                </Box>

                <Box
                  component="span"
                  sx={{
                    display: {
                      xs: "none",
                      sm: "inline",
                    },
                  }}
                >
                  問い合わせ
                </Box>
              </Button>
            </Badge>

            {/* ログアウト */}
            <Button
              variant="outlined"
              color="primary"
              onClick={handleLogout}
              sx={{
                minHeight: 42,
                px: {
                  xs: 1.5,
                  md: 2.5,
                },
                bgcolor: "background.paper",
                borderWidth: 1.5,

                "&:hover": {
                  borderWidth: 1.5,
                  bgcolor: "primary.light",
                },
              }}
            >
              <Box
                component="span"
                sx={{
                  display: {
                    xs: "none",
                    sm: "inline",
                  },
                }}
              >
                ログアウト
              </Box>

              <Box
                component="span"
                sx={{
                  display: {
                    xs: "inline",
                    sm: "none",
                  },
                }}
              >
                出る
              </Box>
            </Button>
          </Box>
        </Toolbar>
      </Container>
    </AppBar>
  );
}
