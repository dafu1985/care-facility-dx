import { createTheme } from "@mui/material/styles";

/**
 * Care Facility DX 共通テーマ
 *
 * 方針:
 * - 業務システムとしての視認性は維持する
 * - 明るく親しみやすい配色にする
 * - カードやボタンは丸みを持たせる
 * - 強すぎる影は避ける
 */
export const theme = createTheme({
  palette: {
    mode: "light",

    primary: {
      main: "#6366F1",
      light: "#EEF2FF",
      dark: "#4F46E5",
      contrastText: "#FFFFFF",
    },

    secondary: {
      main: "#FF8A65",
      light: "#FFF1EC",
      dark: "#F26B45",
      contrastText: "#FFFFFF",
    },

    success: {
      main: "#4DB6AC",
      light: "#E8F7F5",
      dark: "#2D8F87",
    },

    warning: {
      main: "#FFCA58",
      light: "#FFF7DF",
      dark: "#D99A00",
    },

    error: {
      main: "#EF6A78",
      light: "#FDECEF",
      dark: "#D94A5B",
    },

    info: {
      main: "#4DA3FF",
      light: "#EAF4FF",
      dark: "#287FCC",
    },

    background: {
      default: "#F7F8FC",
      paper: "#FFFFFF",
    },

    text: {
      primary: "#30334A",
      secondary: "#74788D",
    },

    divider: "#E8EAF2",
  },

  shape: {
    borderRadius: 16,
  },

  typography: {
    fontFamily:
      '"Noto Sans JP", "Hiragino Kaku Gothic ProN", "Yu Gothic", sans-serif',

    h4: {
      fontWeight: 700,
    },

    h5: {
      fontWeight: 700,
    },

    h6: {
      fontWeight: 700,
    },

    button: {
      fontWeight: 700,
      textTransform: "none",
    },
  },

  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          boxShadow: "none",
          paddingLeft: 20,
          paddingRight: 20,
        },
      },
    },

    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 20,
          boxShadow: "0 6px 24px rgba(79, 70, 229, 0.08)",
          border: "1px solid #EEF0F6",
        },
      },
    },

    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundImage: "none",
        },
      },
    },

    MuiChip: {
      styleOverrides: {
        root: {
          borderRadius: 10,
          fontWeight: 700,
        },
      },
    },

    MuiTextField: {
      defaultProps: {
        variant: "outlined",
      },
    },

    MuiOutlinedInput: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          backgroundColor: "#FFFFFF",
        },
      },
    },

    MuiDialog: {
      styleOverrides: {
        paper: {
          borderRadius: 20,
        },
      },
    },
  },
});
