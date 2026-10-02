import { CssBaseline, ThemeProvider } from "@mui/material";
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";

import App from "./App.tsx";
import { theme } from "./theme/theme";

/**
 * アプリケーションのエントリーポイント。
 *
 * ThemeProvider:
 * Care Facility DX 全体に共通デザインを適用する。
 *
 * CssBaseline:
 * ブラウザごとの差を抑え、MUIテーマを基準にした
 * ベーススタイルを適用する。
 */
createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <App />
    </ThemeProvider>
  </StrictMode>,
);
