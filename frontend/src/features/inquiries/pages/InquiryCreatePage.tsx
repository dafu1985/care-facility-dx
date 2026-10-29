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

  const [isLoading, setIsLoading] = useState(Boolean(facilityId));

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
        <Card
          sx={{
            borderRadius: 4,
            background:
              "linear-gradient(135deg, #EEF2FF 0%, #FFF1EC 55%, #E8F7F5 100%)",
            border: "1px solid",
            borderColor: "divider",
            boxShadow: "none",
            overflow: "hidden",
          }}
        >
          <CardContent
            sx={{
              p: { xs: 3, sm: 4 },
              "&:last-child": {
                pb: { xs: 3, sm: 4 },
              },
            }}
          >
            <Stack spacing={2.5}>
              {/* ページタイトル */}
              <Box>
                <Typography
                  variant="overline"
                  sx={{
                    color: "primary.main",
                    fontWeight: 800,
                    letterSpacing: 1.5,
                  }}
                >
                  FACILITY INQUIRY
                </Typography>

                <Typography
                  variant="h4"
                  component="h1"
                  sx={{
                    fontWeight: 800,
                    fontSize: { xs: "1.5rem", sm: "2rem" },
                    mt: 0.5,
                  }}
                >
                  ✉️ 施設への問い合わせ
                </Typography>

                <Typography
                  variant="body2"
                  color="text.secondary"
                  sx={{ mt: 1, lineHeight: 1.8 }}
                >
                  施設の空き状況や受入条件についてお問い合わせいただけます。
                </Typography>
              </Box>

              {/* 問い合わせ先施設 */}
              <Box
                sx={{
                  p: { xs: 2, sm: 2.5 },
                  bgcolor: "rgba(255, 255, 255, 0.75)",
                  borderRadius: 2.5,
                }}
              >
                <Typography
                  variant="caption"
                  sx={{
                    color: "text.secondary",
                    fontWeight: 700,
                  }}
                >
                  🏡 お問い合わせ先
                </Typography>

                <Typography
                  variant="h6"
                  sx={{
                    fontWeight: 800,
                    mt: 1,
                    mb: 0.5,
                    overflowWrap: "anywhere",
                  }}
                >
                  {facility.name}
                </Typography>

                <Typography
                  variant="body2"
                  color="text.secondary"
                  sx={{
                    overflowWrap: "anywhere",
                  }}
                >
                  📍 {facility.address ?? facility.area}
                </Typography>
              </Box>
            </Stack>

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
        <Card
          variant="outlined"
          sx={{
            borderRadius: 3,
            borderColor: "divider",
            bgcolor: "background.paper",
            boxShadow: "0 4px 16px rgba(99, 102, 241, 0.04)",
          }}
        >
          <CardContent
            sx={{
              p: { xs: 2.5, sm: 3 },
              "&:last-child": {
                pb: { xs: 2.5, sm: 3 },
              },
            }}
          >
            <Stack spacing={2.5}>
              <Box>
                <Typography
                  variant="h6"
                  component="h2"
                  sx={{
                    fontWeight: 800,
                    mb: 0.5,
                  }}
                >
                  📝 お問い合わせ内容
                </Typography>

                <Typography
                  variant="body2"
                  color="text.secondary"
                  sx={{ lineHeight: 1.8 }}
                >
                  件名とお問い合わせ内容を入力してください。
                </Typography>
              </Box>

              {error && <Alert severity="error">{error}</Alert>}

              <TextField
                label="件名"
                value={subject}
                onChange={(event) => {
                  setSubject(event.target.value);
                }}
                placeholder="例：入居受け入れについてのご相談"
                slotProps={{
                  htmlInput: {
                    maxLength: 255,
                  },
                }}
                helperText={`${subject.length}/255文字`}
                required
                fullWidth
                sx={{
                  "& .MuiOutlinedInput-root": {
                    borderRadius: 2.5,
                    bgcolor: "#F8FAFC",
                    "&.Mui-focused": {
                      bgcolor: "background.paper",
                    },
                  },
                  "& .MuiFormHelperText-root": {
                    textAlign: "right",
                    mx: 0.5,
                  },
                }}
              />
              <TextField
                label="問い合わせ内容"
                value={body}
                onChange={(event) => {
                  setBody(event.target.value);
                }}
                placeholder={
                  "例：要介護3の利用者について、現在受け入れ可能でしょうか。\n" +
                  "受け入れ可能な場合、入居時期や必要な手続きについても教えてください。"
                }
                multiline
                minRows={6}
                required
                fullWidth
                sx={{
                  "& .MuiOutlinedInput-root": {
                    borderRadius: 2.5,
                    bgcolor: "#F8FAFC",
                    alignItems: "flex-start",
                    "&.Mui-focused": {
                      bgcolor: "background.paper",
                    },
                  },
                  "& .MuiInputBase-inputMultiline": {
                    lineHeight: 1.9,
                  },
                }}
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
                sx={{
                  bgcolor: "#6366F1",
                  borderRadius: 2.5,
                  px: 4,
                  py: 1.5,
                  fontWeight: 800,
                  textTransform: "none",
                  alignSelf: { xs: "stretch", sm: "flex-end" },
                  boxShadow: "0 6px 18px rgba(99, 102, 241, 0.2)",
                  "&:hover": {
                    bgcolor: "#4F46E5",
                  },
                  "&.Mui-disabled": {
                    boxShadow: "none",
                  },
                }}
              >
                {isSubmitting ? "送信中..." : "✉️ 問い合わせを送信"}
              </Button>
            </Stack>
          </CardContent>
        </Card>
      </Stack>
    </Container>
  );
}
