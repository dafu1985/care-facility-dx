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
import axios from "axios";
import { useEffect, useState } from "react";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";

import { getFacility } from "../../facilities/api/get-facility";
import type { FacilitySearchItem } from "../../facilities/types/facility-search";

import { createInquiry } from "../api/create-inquiry";

/**
 * ケアマネジャー向け問い合わせ作成画面。
 */
export function InquiryCreatePage() {
  const navigate = useNavigate();

  const { facilityId } = useParams<{
    facilityId: string;
  }>();

  const [searchParams] = useSearchParams();

  /**
   * 案件の候補施設から遷移した場合に設定される。
   * 通常の施設詳細画面からの問い合わせでは null。
   */
  const placementCaseId = searchParams.get("placementCaseId");

  const candidateFacilityId = searchParams.get("candidateFacilityId");

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
      setIsLoading(false);
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

        setError(
          "施設情報の取得に失敗しました。時間をおいて再度お試しください。",
        );
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
  async function handleSubmit() {
    if (!facilityId || isSubmitting) {
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

        /**
         * 候補施設経由の場合のみ案件IDを送信する。
         */
        ...(placementCaseId
          ? {
              placementCaseId,
            }
          : {}),

        /**
         * 候補施設経由の場合のみ候補施設IDを送信する。
         */
        ...(candidateFacilityId
          ? {
              candidateFacilityId,
            }
          : {}),

        subject: trimmedSubject,
        body: trimmedBody,
      });

      navigate(`/inquiries/${response.inquiryId}`);
    } catch (error) {
      console.error("問い合わせの作成に失敗しました。", error);

      /**
       * 同じ候補施設に対してOPENな問い合わせが
       * すでに存在している場合。
       */
      if (axios.isAxiosError(error) && error.response?.status === 409) {
        setError("この候補施設には、すでに進行中の問い合わせがあります。");
        return;
      }

      setError(
        "問い合わせの作成に失敗しました。時間をおいて再度お試しください。",
      );
    } finally {
      setIsSubmitting(false);
    }
  }

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
   * 初期取得エラー。
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
   * 施設情報が取得できなかった場合。
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
          問い合わせ先の施設情報を取得できませんでした。
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
              if (placementCaseId) {
                navigate(`/placement-cases/${placementCaseId}`);
                return;
              }

              navigate(`/facilities/${facility.facilityId}`);
            }}
          >
            ← 戻る
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

            {placementCaseId && candidateFacilityId && (
              <Alert
                severity="info"
                sx={{
                  mt: 2,
                }}
              >
                施設探し案件の候補施設への問い合わせです。
              </Alert>
            )}
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
                onChange={(event) => {
                  setSubject(event.target.value);
                }}
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
                onChange={(event) => {
                  setBody(event.target.value);
                }}
                placeholder="例：要介護3の利用者について、現在受け入れ可能でしょうか。"
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
