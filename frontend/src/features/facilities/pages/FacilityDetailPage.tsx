import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  CircularProgress,
  Container,
  Stack,
  Typography,
} from "@mui/material";
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import { getFacility } from "../api/get-facility";

import type {
  AvailabilityStatus,
  FacilitySearchItem,
} from "../types/facility-search";

/**
 * 空き状況を日本語表示へ変換する。
 */
function getAvailabilityLabel(status: AvailabilityStatus): string {
  switch (status) {
    case "AVAILABLE":
      return "空きあり";

    case "FEW":
      return "残りわずか";

    case "FULL":
      return "空きなし";

    case "UNKNOWN":
      return "未確認";

    default:
      return status;
  }
}

/**
 * booleanの受入条件を日本語表示へ変換する。
 */
function getAcceptedLabel(accepted: boolean): string {
  return accepted ? "対応可" : "対応不可";
}

/**
 * CARE_MANAGER向け施設詳細画面。
 */
export function FacilityDetailPage() {
  const navigate = useNavigate();

  const { facilityId } = useParams<{
    facilityId: string;
  }>();

  const [facility, setFacility] = useState<FacilitySearchItem | null>(null);

  const [isLoading, setIsLoading] = useState(true);

  const [error, setError] = useState<string | null>(null);

  /**
   * 施設詳細を取得する。
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

        console.error("施設詳細の取得に失敗しました。", error);

        setError("施設詳細の取得に失敗しました。");
      })
      .finally(() => {
        if (cancelled) {
          return;
        }

        setIsLoading(false);
      });

    /**
     * コンポーネント破棄後に
     * state更新しないようにする。
     */
    return () => {
      cancelled = true;
    };
  }, [facilityId]);

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
   * 施設情報なし。
   */
  if (!facility) {
    return (
      <Container
        maxWidth="md"
        sx={{
          py: 4,
        }}
      >
        <Alert severity="warning">施設情報を取得できませんでした。</Alert>
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
              navigate("/facilities");
            }}
          >
            ← 施設検索へ戻る
          </Button>
        </Box>

        {/* 施設基本情報 */}
        <Card>
          <CardContent>
            <Stack spacing={1.5}>
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "flex-start",
                  gap: 2,
                }}
              >
                <Box>
                  <Typography variant="h4" component="h1" gutterBottom>
                    {facility.name}
                  </Typography>

                  <Typography color="text.secondary">
                    {facility.facilityType?.name ?? "施設種別未登録"}
                  </Typography>
                </Box>

                {facility.availability && (
                  <Chip
                    label={getAvailabilityLabel(facility.availability.status)}
                  />
                )}
              </Box>

              <Typography>〒{facility.postalCode ?? "未登録"}</Typography>

              <Typography>{facility.address ?? facility.area}</Typography>

              <Typography>
                電話番号：
                {facility.phone ?? "未登録"}
              </Typography>

              {facility.description && (
                <Typography
                  sx={{
                    mt: 2,
                  }}
                >
                  {facility.description}
                </Typography>
              )}
            </Stack>
          </CardContent>
        </Card>

        {/* 空き状況 */}
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              空き状況
            </Typography>

            {facility.availability ? (
              <Stack spacing={1}>
                <Typography>
                  状況：
                  {getAvailabilityLabel(facility.availability.status)}
                </Typography>

                <Typography>
                  空き数：
                  {facility.availability.availableCount === null
                    ? "未確認"
                    : `${facility.availability.availableCount}床`}
                </Typography>

                <Typography>
                  入居可能日：
                  {facility.availability.availableFrom ?? "未確認"}
                </Typography>
              </Stack>
            ) : (
              <Alert severity="info">空き状況は登録されていません。</Alert>
            )}
          </CardContent>
        </Card>

        {/* 料金 */}
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              料金
            </Typography>

            {facility.pricing ? (
              <Stack spacing={1}>
                <Typography>
                  月額：
                  {facility.pricing.monthlyCostMin.toLocaleString()}円 〜{" "}
                  {facility.pricing.monthlyCostMax.toLocaleString()}円
                </Typography>

                <Typography>
                  入居一時金：
                  {facility.pricing.entranceFee.toLocaleString()}円
                </Typography>

                {facility.pricing.note && (
                  <Typography color="text.secondary">
                    {facility.pricing.note}
                  </Typography>
                )}
              </Stack>
            ) : (
              <Alert severity="info">料金情報は登録されていません。</Alert>
            )}
          </CardContent>
        </Card>

        {/* 受入条件 */}
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              受入条件
            </Typography>

            {facility.requirement ? (
              <Stack spacing={1}>
                <Typography>
                  要介護度：
                  {facility.requirement.minCareLevel ?? "未設定"}〜
                  {facility.requirement.maxCareLevel ?? "未設定"}
                </Typography>

                <Typography>
                  認知症：
                  {getAcceptedLabel(facility.requirement.dementiaAccepted)}
                </Typography>

                <Typography>
                  医療ケア：
                  {getAcceptedLabel(facility.requirement.medicalCareAccepted)}
                </Typography>

                <Typography>
                  車椅子：
                  {getAcceptedLabel(facility.requirement.wheelchairAccepted)}
                </Typography>

                <Typography>
                  看取り：
                  {getAcceptedLabel(facility.requirement.endOfLifeCare)}
                </Typography>

                {facility.requirement.note && (
                  <Typography
                    color="text.secondary"
                    sx={{
                      mt: 1,
                    }}
                  >
                    {facility.requirement.note}
                  </Typography>
                )}
              </Stack>
            ) : (
              <Alert severity="info">受入条件は登録されていません。</Alert>
            )}
          </CardContent>
        </Card>

        {/* 問い合わせ */}
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              この施設について問い合わせる
            </Typography>

            <Typography
              color="text.secondary"
              sx={{
                mb: 2,
              }}
            >
              空き状況や受入条件について、 施設へ直接問い合わせできます。
            </Typography>

            <Button
              variant="contained"
              size="large"
              onClick={() => {
                navigate(`/facilities/${facility.facilityId}/inquiry`);
              }}
            >
              この施設に問い合わせる
            </Button>
          </CardContent>
        </Card>
      </Stack>
    </Container>
  );
}
