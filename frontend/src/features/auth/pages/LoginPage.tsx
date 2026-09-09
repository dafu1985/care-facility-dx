import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  CircularProgress,
  Container,
  TextField,
  Typography,
} from "@mui/material";
import { type FormEvent, useState } from "react";
import { useNavigate } from "react-router-dom";

import { login } from "../api/login";
import { saveAccessToken } from "../utils/token-storage";

/**
 * ログイン画面。
 */
export function LoginPage() {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");

  const [password, setPassword] = useState("");

  const [error, setError] = useState<string | null>(null);

  const [loading, setLoading] = useState(false);

  /**
   * ログイン処理。
   */
  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    setError(null);
    setLoading(true);

    try {
      /**
       * Backendへログイン要求を送信する。
       */
      const response = await login({
        email,
        password,
      });

      /**
       * Backendから取得したJWTを保存する。
       */
      saveAccessToken(response.accessToken);

      /**
       * ログイン成功後は
       * ホーム画面へ遷移する。
       *
       * HomePage側でユーザー権限を判定し、
       * FACILITY / CARE_MANAGERごとの
       * 画面を表示する。
       */
      navigate("/", {
        replace: true,
      });
    } catch (error) {
      console.error("ログインに失敗しました。", error);

      setError("メールアドレスまたはパスワードが正しくありません。");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container
      maxWidth="sm"
      sx={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
      }}
    >
      <Card
        sx={{
          width: "100%",
        }}
      >
        <CardContent
          sx={{
            p: 4,
          }}
        >
          <Box component="form" onSubmit={handleSubmit}>
            <Typography variant="h4" component="h1" gutterBottom>
              Care Facility DX
            </Typography>

            <Typography
              variant="body1"
              color="text.secondary"
              sx={{
                mb: 3,
              }}
            >
              ログインしてください
            </Typography>

            {error && (
              <Alert
                severity="error"
                sx={{
                  mb: 2,
                }}
              >
                {error}
              </Alert>
            )}

            <TextField
              label="メールアドレス"
              type="email"
              value={email}
              onChange={(event) => {
                setEmail(event.target.value);
              }}
              required
              fullWidth
              autoComplete="email"
              sx={{
                mb: 2,
              }}
            />

            <TextField
              label="パスワード"
              type="password"
              value={password}
              onChange={(event) => {
                setPassword(event.target.value);
              }}
              required
              fullWidth
              autoComplete="current-password"
              sx={{
                mb: 3,
              }}
            />

            <Button
              type="submit"
              variant="contained"
              fullWidth
              size="large"
              disabled={loading}
            >
              {loading ? <CircularProgress size={24} /> : "ログイン"}
            </Button>
          </Box>
        </CardContent>
      </Card>
    </Container>
  );
}
