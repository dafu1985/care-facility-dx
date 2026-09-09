import {
  Alert,
  Box,
  Button,
  Card,
  CardActionArea,
  CardContent,
  Checkbox,
  Chip,
  CircularProgress,
  Container,
  FormControlLabel,
  MenuItem,
  Pagination,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import { useState } from "react";
import { useNavigate } from "react-router-dom";

import { searchFacilities } from "../api/search-facilities";

import type {
  AvailabilityStatus,
  FacilitySearchParams,
  FacilitySearchResponse,
} from "../types/facility-search";

/**
 * 空き状況の日本語表示。
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
 * ケアマネ向け施設検索画面。
 */
export function FacilitySearchPage() {
  const navigate = useNavigate();

  /**
   * 検索条件。
   */
  const [area, setArea] = useState("");

  const [availability, setAvailability] = useState<AvailabilityStatus | "">("");

  const [maxMonthlyCost, setMaxMonthlyCost] = useState("");

  const [careLevel, setCareLevel] = useState("");

  const [dementiaAccepted, setDementiaAccepted] = useState(false);

  const [medicalCareAccepted, setMedicalCareAccepted] = useState(false);

  const [wheelchairAccepted, setWheelchairAccepted] = useState(false);

  const [endOfLifeCare, setEndOfLifeCare] = useState(false);

  /**
   * 検索結果。
   */
  const [result, setResult] = useState<FacilitySearchResponse | null>(null);

  const [isLoading, setIsLoading] = useState(false);

  const [error, setError] = useState<string | null>(null);

  /**
   * 検索条件を生成する。
   */
  const createSearchParams = (page: number): FacilitySearchParams => {
    const params: FacilitySearchParams = {
      page,
      pageSize: 20,
    };

    if (area.trim() !== "") {
      params.area = area.trim();
    }

    if (availability !== "") {
      params.availability = availability;
    }

    if (maxMonthlyCost !== "") {
      params.maxMonthlyCost = Number(maxMonthlyCost);
    }

    if (careLevel !== "") {
      params.careLevel = Number(careLevel);
    }

    /**
     * CheckboxがONの条件だけ送信する。
     *
     * falseを送ると、
     * 「対応不可の施設を検索する」
     * という別の意味になり得るため。
     */
    if (dementiaAccepted) {
      params.dementiaAccepted = true;
    }

    if (medicalCareAccepted) {
      params.medicalCareAccepted = true;
    }

    if (wheelchairAccepted) {
      params.wheelchairAccepted = true;
    }

    if (endOfLifeCare) {
      params.endOfLifeCare = true;
    }

    return params;
  };

  /**
   * 施設検索。
   */
  const handleSearch = async (page = 1) => {
    try {
      setIsLoading(true);
      setError(null);

      const response = await searchFacilities(createSearchParams(page));

      setResult(response);
    } catch (error) {
      console.error("施設検索に失敗しました。", error);

      setError("施設検索に失敗しました。");
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * 検索条件クリア。
   */
  const handleClear = () => {
    setArea("");
    setAvailability("");
    setMaxMonthlyCost("");
    setCareLevel("");

    setDementiaAccepted(false);
    setMedicalCareAccepted(false);
    setWheelchairAccepted(false);
    setEndOfLifeCare(false);

    setResult(null);
    setError(null);
  };

  return (
    <Container
      maxWidth="lg"
      sx={{
        py: 4,
      }}
    >
      <Stack spacing={3}>
        {/* ヘッダー */}
        <Box>
          <Button
            onClick={() => {
              navigate("/");
            }}
            sx={{
              mb: 2,
            }}
          >
            ← ホームへ戻る
          </Button>

          <Typography variant="h4" component="h1" gutterBottom>
            介護施設検索
          </Typography>

          <Typography color="text.secondary">
            利用者様の条件に合う施設を検索します。
          </Typography>
        </Box>

        {/* 検索条件 */}
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              検索条件
            </Typography>

            <Stack spacing={2}>
              {/* エリア */}
              <TextField
                label="エリア"
                value={area}
                onChange={(event) => setArea(event.target.value)}
                placeholder="例：新潟市中央区"
                fullWidth
              />

              {/* 空き状況 */}
              <TextField
                select
                label="空き状況"
                value={availability}
                onChange={(event) =>
                  setAvailability(event.target.value as AvailabilityStatus | "")
                }
                fullWidth
              >
                <MenuItem value="">指定なし</MenuItem>

                <MenuItem value="AVAILABLE">空きあり</MenuItem>

                <MenuItem value="FEW">残りわずか</MenuItem>

                <MenuItem value="FULL">空きなし</MenuItem>

                <MenuItem value="UNKNOWN">未確認</MenuItem>
              </TextField>

              {/* 月額上限 */}
              <TextField
                label="月額料金上限"
                type="number"
                value={maxMonthlyCost}
                onChange={(event) => setMaxMonthlyCost(event.target.value)}
                slotProps={{
                  htmlInput: {
                    min: 0,
                  },
                }}
                helperText="この金額以下の施設を検索します"
                fullWidth
              />

              {/* 要介護度 */}
              <TextField
                select
                label="要介護度"
                value={careLevel}
                onChange={(event) => setCareLevel(event.target.value)}
                fullWidth
              >
                <MenuItem value="">指定なし</MenuItem>

                {[1, 2, 3, 4, 5].map((level) => (
                  <MenuItem key={level} value={String(level)}>
                    要介護{level}
                  </MenuItem>
                ))}
              </TextField>

              {/* 受入条件 */}
              <Box>
                <Typography
                  variant="subtitle1"
                  sx={{
                    mb: 1,
                  }}
                >
                  必要な対応
                </Typography>

                <Stack>
                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={dementiaAccepted}
                        onChange={(event) =>
                          setDementiaAccepted(event.target.checked)
                        }
                      />
                    }
                    label="認知症対応"
                  />

                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={medicalCareAccepted}
                        onChange={(event) =>
                          setMedicalCareAccepted(event.target.checked)
                        }
                      />
                    }
                    label="医療ケア対応"
                  />

                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={wheelchairAccepted}
                        onChange={(event) =>
                          setWheelchairAccepted(event.target.checked)
                        }
                      />
                    }
                    label="車椅子対応"
                  />

                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={endOfLifeCare}
                        onChange={(event) =>
                          setEndOfLifeCare(event.target.checked)
                        }
                      />
                    }
                    label="看取り対応"
                  />
                </Stack>
              </Box>

              {/* 検索操作 */}
              <Stack
                direction={{
                  xs: "column",
                  sm: "row",
                }}
                spacing={2}
              >
                <Button
                  variant="contained"
                  onClick={() => {
                    void handleSearch(1);
                  }}
                  disabled={isLoading}
                  fullWidth
                >
                  検索
                </Button>

                <Button
                  variant="outlined"
                  onClick={handleClear}
                  disabled={isLoading}
                  fullWidth
                >
                  条件をクリア
                </Button>
              </Stack>
            </Stack>
          </CardContent>
        </Card>

        {error && <Alert severity="error">{error}</Alert>}

        {/* ローディング */}
        {isLoading && (
          <Box
            sx={{
              display: "flex",
              justifyContent: "center",
              py: 4,
            }}
          >
            <CircularProgress />
          </Box>
        )}

        {/* 検索結果 */}
        {!isLoading && result && (
          <Stack spacing={2}>
            <Typography variant="h5">検索結果</Typography>

            <Typography color="text.secondary">
              {result.total}件見つかりました
            </Typography>

            {result.items.length === 0 ? (
              <Alert severity="info">条件に一致する施設はありません。</Alert>
            ) : (
              result.items.map((facility) => (
                <Card key={facility.facilityId} variant="outlined">
                  <CardActionArea
                    onClick={() => {
                      navigate(`/facilities/${facility.facilityId}`);
                    }}
                  >
                    <CardContent>
                      <Stack spacing={1.5}>
                        <Box
                          sx={{
                            display: "flex",
                            justifyContent: "space-between",
                            gap: 2,
                          }}
                        >
                          <Box>
                            <Typography
                              variant="h6"
                              component="h2"
                              sx={{
                                fontWeight: 700,
                              }}
                            >
                              {facility.name}
                            </Typography>

                            <Typography color="text.secondary">
                              {facility.facilityType?.name ?? "施設種別未登録"}
                            </Typography>
                          </Box>

                          {facility.availability && (
                            <Chip
                              label={getAvailabilityLabel(
                                facility.availability.status,
                              )}
                              size="small"
                            />
                          )}
                        </Box>

                        <Typography>
                          {facility.address ?? facility.area}
                        </Typography>

                        {facility.pricing && (
                          <Typography>
                            月額：
                            {facility.pricing.monthlyCostMin.toLocaleString()}円
                            〜{" "}
                            {facility.pricing.monthlyCostMax.toLocaleString()}円
                          </Typography>
                        )}

                        {facility.availability && (
                          <Typography>
                            空き数：
                            {facility.availability.availableCount ?? "-"}床
                          </Typography>
                        )}

                        {facility.requirement && (
                          <Stack
                            direction="row"
                            spacing={1}
                            sx={{
                              flexWrap: "wrap",
                              gap: 1,
                            }}
                          >
                            {facility.requirement.dementiaAccepted && (
                              <Chip label="認知症" size="small" />
                            )}

                            {facility.requirement.medicalCareAccepted && (
                              <Chip label="医療ケア" size="small" />
                            )}

                            {facility.requirement.wheelchairAccepted && (
                              <Chip label="車椅子" size="small" />
                            )}

                            {facility.requirement.endOfLifeCare && (
                              <Chip label="看取り" size="small" />
                            )}
                          </Stack>
                        )}
                      </Stack>
                    </CardContent>
                  </CardActionArea>
                </Card>
              ))
            )}

            {/* ページネーション */}
            {result.total > result.pageSize && (
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "center",
                  pt: 2,
                }}
              >
                <Pagination
                  page={result.page}
                  count={Math.ceil(result.total / result.pageSize)}
                  onChange={(_event, page) => {
                    void handleSearch(page);
                  }}
                />
              </Box>
            )}
          </Stack>
        )}
      </Stack>
    </Container>
  );
}
