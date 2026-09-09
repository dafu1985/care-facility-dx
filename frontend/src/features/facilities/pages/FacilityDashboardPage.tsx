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
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import { getFacilityDashboard } from "../api/get-facility-dashboard";
import { AvailabilityEditDialog } from "../components/AvailabilityEditDialog";
import { PricingEditDialog } from "../components/PricingEditDialog";
import type { FacilityDashboardResponse } from "../types/facility";
import { RequirementEditDialog } from "../components/RequirementEditDialog";
import { FacilityEditDialog } from "../components/FacilityEditDialog";

interface FacilityDashboardPageProps {
  facilityId: string;
}

/**
 * 施設職員向けダッシュボード画面。
 *
 * 所属施設の施設情報・空き状況・料金・受入条件・
 * 問い合わせサマリーを表示する。
 */
export function FacilityDashboardPage({
  facilityId,
}: FacilityDashboardPageProps) {
  /**
   * 画面遷移用。
   */
  const navigate = useNavigate();
  const [dashboard, setDashboard] = useState<FacilityDashboardResponse | null>(
    null,
  );

  const [isLoading, setIsLoading] = useState(true);

  const [error, setError] = useState<string | null>(null);

  /**
   * 空き状況編集ダイアログの表示状態。
   */
  const [isAvailabilityDialogOpen, setIsAvailabilityDialogOpen] =
    useState(false);

  /**
   * 料金編集ダイアログの表示状態。
   */
  const [isPricingDialogOpen, setIsPricingDialogOpen] = useState(false);

  const [isRequirementDialogOpen, setIsRequirementDialogOpen] = useState(false);

  const [isFacilityDialogOpen, setIsFacilityDialogOpen] = useState(false);

  /**
   * 初回表示・facilityId変更時に
   * ダッシュボード情報を取得する。
   */
  useEffect(() => {
    let cancelled = false;

    getFacilityDashboard(facilityId)
      .then((response) => {
        if (cancelled) {
          return;
        }

        setDashboard(response);
        setError(null);
      })
      .catch((error) => {
        if (cancelled) {
          return;
        }

        console.error("施設ダッシュボードの取得に失敗しました。", error);

        setError("施設ダッシュボードの取得に失敗しました。");
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
   * 編集後などにダッシュボードを再取得する。
   */
  const refreshDashboard = async () => {
    try {
      const response = await getFacilityDashboard(facilityId);

      setDashboard(response);
      setError(null);
    } catch (error) {
      console.error("施設ダッシュボードの再取得に失敗しました。", error);

      setError("施設ダッシュボードの再取得に失敗しました。");
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
   * API取得失敗。
   */
  if (error) {
    return (
      <Container
        sx={{
          py: 4,
        }}
      >
        <Alert severity="error">{error}</Alert>
      </Container>
    );
  }

  /**
   * ダッシュボード情報が存在しない場合。
   */
  if (!dashboard) {
    return (
      <Container
        sx={{
          py: 4,
        }}
      >
        <Alert severity="warning">施設情報を取得できませんでした。</Alert>
      </Container>
    );
  }

  const { facility, completion, inquirySummary } = dashboard;

  return (
    <>
      <Container
        maxWidth="lg"
        sx={{
          py: 4,
        }}
      >
        <Stack spacing={3}>
          {/* 施設基本情報 */}
          <Card>
            <CardContent>
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
                    {facility.facilityType.name}
                  </Typography>

                  <Typography color="text.secondary">
                    {facility.address ?? "住所未登録"}
                  </Typography>

                  <Typography color="text.secondary">
                    エリア：
                    {facility.area}
                  </Typography>

                  <Typography color="text.secondary">
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
                </Box>

                <Button
                  variant="outlined"
                  size="small"
                  onClick={() => setIsFacilityDialogOpen(true)}
                >
                  編集
                </Button>
              </Box>
            </CardContent>
          </Card>

          {/* 空き状況 */}
          <Card>
            <CardContent>
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  mb: 2,
                }}
              >
                <Typography variant="h6">空き状況</Typography>

                <Button
                  variant="outlined"
                  size="small"
                  onClick={() => setIsAvailabilityDialogOpen(true)}
                >
                  編集
                </Button>
              </Box>

              {facility.availability ? (
                <Stack spacing={1}>
                  <Typography>
                    ステータス：
                    {facility.availability.status}
                  </Typography>

                  <Typography>
                    空き数：
                    {facility.availability.availableCount ?? "-"}床
                  </Typography>

                  <Typography>
                    入居可能日：
                    {facility.availability.availableFrom ?? "-"}
                  </Typography>

                  {facility.availability.note && (
                    <Typography color="text.secondary">
                      {facility.availability.note}
                    </Typography>
                  )}
                </Stack>
              ) : (
                <Alert severity="warning">空き状況が登録されていません。</Alert>
              )}
            </CardContent>
          </Card>

          {/* 料金 */}
          <Card>
            <CardContent>
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  mb: 2,
                }}
              >
                <Typography variant="h6">料金</Typography>

                <Button
                  variant="outlined"
                  size="small"
                  onClick={() => setIsPricingDialogOpen(true)}
                >
                  編集
                </Button>
              </Box>

              {facility.pricing ? (
                <Stack spacing={1}>
                  <Typography>
                    月額：
                    {facility.pricing.monthlyCostMin?.toLocaleString() ?? "-"}円
                    〜{" "}
                    {facility.pricing.monthlyCostMax?.toLocaleString() ?? "-"}円
                  </Typography>

                  <Typography>
                    入居一時金：
                    {facility.pricing.entranceFee?.toLocaleString() ?? "-"}円
                  </Typography>

                  {facility.pricing.note && (
                    <Typography color="text.secondary">
                      {facility.pricing.note}
                    </Typography>
                  )}
                </Stack>
              ) : (
                <Alert severity="warning">料金情報が登録されていません。</Alert>
              )}
            </CardContent>
          </Card>

          {/* 受入条件 */}
          <Card>
            <CardContent>
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  mb: 2,
                }}
              >
                <Typography variant="h6">受入条件</Typography>

                <Button
                  variant="outlined"
                  size="small"
                  onClick={() => setIsRequirementDialogOpen(true)}
                >
                  編集
                </Button>
              </Box>

              {facility.requirement ? (
                <Stack spacing={1}>
                  <Typography>
                    要介護度：
                    {facility.requirement.minCareLevel ?? "-"}〜
                    {facility.requirement.maxCareLevel ?? "-"}
                  </Typography>

                  <Typography>
                    認知症：
                    {facility.requirement.dementiaAccepted
                      ? "対応可"
                      : "対応不可"}
                  </Typography>

                  <Typography>
                    医療ケア：
                    {facility.requirement.medicalCareAccepted
                      ? "対応可"
                      : "対応不可"}
                  </Typography>

                  <Typography>
                    車椅子：
                    {facility.requirement.wheelchairAccepted
                      ? "対応可"
                      : "対応不可"}
                  </Typography>

                  <Typography>
                    看取り：
                    {facility.requirement.endOfLifeCare ? "対応可" : "対応不可"}
                  </Typography>

                  {facility.requirement.note && (
                    <Typography color="text.secondary">
                      {facility.requirement.note}
                    </Typography>
                  )}
                </Stack>
              ) : (
                <Alert severity="warning">受入条件が登録されていません。</Alert>
              )}
            </CardContent>
          </Card>

          {/* 問い合わせ */}
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                問い合わせ
              </Typography>

              <Stack spacing={1}>
                <Typography>
                  対応中：
                  {inquirySummary.openCount}件
                </Typography>

                <Typography>
                  未返信：
                  {inquirySummary.unansweredCount}件
                </Typography>
              </Stack>

              <Typography
                variant="subtitle1"
                sx={{
                  mt: 3,
                  mb: 1,
                }}
              >
                最近の問い合わせ
              </Typography>

              {inquirySummary.recentInquiries.length === 0 ? (
                <Typography color="text.secondary">
                  問い合わせはありません。
                </Typography>
              ) : (
                <Stack spacing={1}>
                  {inquirySummary.recentInquiries.map((inquiry) => (
                    <Box
                      key={inquiry.inquiryId}
                      sx={{
                        p: 2,
                        border: 1,
                        borderColor: "divider",
                        borderRadius: 1,
                      }}
                    >
                      <Typography
                        sx={{
                          fontWeight: 700,
                        }}
                      >
                        {inquiry.subject}
                      </Typography>

                      <Typography variant="body2" color="text.secondary">
                        ステータス：
                        {inquiry.status}
                      </Typography>
                    </Box>
                  ))}
                </Stack>
              )}

              {/* 問い合わせ一覧画面へ遷移する */}
              <Button
                variant="outlined"
                onClick={() => {
                  navigate("/inquiries");
                }}
                sx={{
                  mt: 2,
                }}
              >
                問い合わせ一覧を見る
              </Button>
            </CardContent>
          </Card>

          {/* 登録状況 */}
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                情報登録状況
              </Typography>

              <Stack spacing={1}>
                <Typography>
                  空き状況：
                  {completion.availability ? "登録済み" : "未登録"}
                </Typography>

                <Typography>
                  料金：
                  {completion.pricing ? "登録済み" : "未登録"}
                </Typography>

                <Typography>
                  受入条件：
                  {completion.requirement ? "登録済み" : "未登録"}
                </Typography>
              </Stack>
            </CardContent>
          </Card>
        </Stack>
      </Container>

      {/* 空き状況編集ダイアログ */}
      <AvailabilityEditDialog
        open={isAvailabilityDialogOpen}
        facilityId={facilityId}
        availability={facility.availability}
        onClose={() => setIsAvailabilityDialogOpen(false)}
        onUpdated={() => {
          void refreshDashboard();
        }}
      />

      {/* 料金編集ダイアログ */}
      <PricingEditDialog
        open={isPricingDialogOpen}
        facilityId={facilityId}
        pricing={facility.pricing}
        onClose={() => setIsPricingDialogOpen(false)}
        onUpdated={() => {
          void refreshDashboard();
        }}
      />
      <RequirementEditDialog
        open={isRequirementDialogOpen}
        facilityId={facilityId}
        requirement={facility.requirement}
        onClose={() => setIsRequirementDialogOpen(false)}
        onUpdated={() => {
          void refreshDashboard();
        }}
      />
      <FacilityEditDialog
        open={isFacilityDialogOpen}
        facilityId={facilityId}
        facility={facility}
        onClose={() => setIsFacilityDialogOpen(false)}
        onUpdated={() => {
          void refreshDashboard();
        }}
      />
    </>
  );
}
