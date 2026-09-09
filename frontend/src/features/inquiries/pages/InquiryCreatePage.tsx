import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  CircularProgress,
  Container,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import { getFacility } from "../../facilities/api/get-facility";
import type { FacilitySearchItem } from "../../facilities/types/facility-search";

import { createInquiry } from "../api/create-inquiry";

/**
 * CARE_MANAGER向け問い合わせ作成画面。
 */
export function InquiryCreatePage() {
  const navigate = useNavigate();

  const { facilityId } = useParams<{
    facilityId: string;
  }>();

  const [facility, setFacility] = useState<FacilitySearchItem | null>(null);

  const [subject, setSubject] = useState("");

  const [body, setBody] = useState("");

  const [isLoading, setIsLoading] = useState(true);

  const [isSubmitting, setIsSubmitting] = useState(false);

  const [error, setError] = useState<string | null>(null);

  /**
   * 問い合わせ先施設の情報を取得する。
   */
  useEffect(() => {
    if (!facilityId) {
      return;
    }

    let cancelled = false;

    getFacility(facilityId)
      .then((response) => {
        if (cancelled) {
          return;
        }

        setFacility(response);
        setError(null);
      })
      .catch((error) => {
        if (cancelled) {
          return;
        }

        console.error("施設情報の取得に失敗しました。", error);

        setError("施設情報の取得に失敗しました。");
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
   * 問い合わせを作成する。
   */
  const handleSubmit = async () => {
    if (!facilityId) {
      return;
    }

    const trimmedSubject = subject.trim();

    const trimmedBody = body.trim();

    if (trimmedSubject === "") {
      setError("件名を入力してください。");

      return;
    }

    if (trimmedSubject.length > 255) {
      setError("件名は255文字以内で入力してください。");

      return;
    }

    if (trimmedBody === "") {
      setError("問い合わせ内容を入力してください。");

      return;
    }

    try {
      setIsSubmitting(true);
      setError(null);

      const response = await createInquiry({
        facilityId,
        subject: trimmedSubject,
        body: trimmedBody,
      });

      /**
       * 作成した問い合わせ詳細へ遷移する。
       */
      navigate(`/inquiries/${response.inquiryId}`);
    } catch (error) {
      console.error("問い合わせ作成に失敗しました。", error);

      setError("問い合わせ作成に失敗しました。");
    } finally {
      setIsSubmitting(false);
    }
  };

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
   * 初期取得失敗。
   */
  if (error && !facility) {
    return (
      <Container
        maxWidth="md"
        sx={{
          py: 4,
        }}
      >
        <Alert severity="error">{error}</Alert>
      </Container>
    );
  }

  /**
   * 施設情報が取得できない場合。
   */
  if (!facility) {
    return (
      <Container
        maxWidth="md"
        sx={{
          py: 4,
        }}
      >
        <Alert severity="warning">
          問い合わせ先施設を取得できませんでした。
        </Alert>
      </Container>
    );
  }

  return (
    <Container
      maxWidth="md"
      sx={{
        py: 4,
      }}
    >
      <Stack spacing={3}>
        {/* 戻る */}
        <Box>
          <Button
            onClick={() => {
              navigate(`/facilities/${facility.facilityId}`);
            }}
          >
            ← 施設詳細へ戻る
          </Button>
        </Box>

        {/* 問い合わせ先 */}
        <Card>
          <CardContent>
            <Typography variant="h5" component="h1" gutterBottom>
              施設への問い合わせ
            </Typography>

            <Typography
              variant="h6"
              sx={{
                mt: 2,
              }}
            >
              {facility.name}
            </Typography>

            <Typography color="text.secondary">
              {facility.address ?? facility.area}
            </Typography>
          </CardContent>
        </Card>

        {/* 入力フォーム */}
        <Card>
          <CardContent>
            <Stack spacing={2}>
              <Typography variant="h6">問い合わせ内容</Typography>

              {error && <Alert severity="error">{error}</Alert>}

              <TextField
                label="件名"
                value={subject}
                onChange={(event) => setSubject(event.target.value)}
                slotProps={{
                  htmlInput: {
                    maxLength: 255,
                  },
                }}
                helperText={`${subject.length}/255文字`}
                required
                fullWidth
              />

              <TextField
                label="問い合わせ内容"
                value={body}
                onChange={(event) => setBody(event.target.value)}
                placeholder="例：要介護3の利用者様について、現在受入可能でしょうか。"
                multiline
                minRows={6}
                required
                fullWidth
              />

              <Button
                variant="contained"
                size="large"
                onClick={() => {
                  void handleSubmit();
                }}
                disabled={
                  isSubmitting || subject.trim() === "" || body.trim() === ""
                }
              >
                {isSubmitting ? "送信中..." : "問い合わせを送信"}
              </Button>
            </Stack>
          </CardContent>
        </Card>
      </Stack>
    </Container>
  );
}
