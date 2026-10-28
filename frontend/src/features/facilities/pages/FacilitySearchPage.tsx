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
            onClick={() => navigate("/")}
            sx={{
              mb: 2,
              color: "text.secondary",
              fontWeight: 600,
            }}
          >
            ← ホームへ戻る
          </Button>

          <Box
            sx={{
              p: { xs: 3, sm: 4 },
              borderRadius: 4,
              background:
                "linear-gradient(135deg, #EEF2FF 0%, #FFF1EC 55%, #E8F7F5 100%)",
              border: "1px solid",
              borderColor: "divider",
            }}
          >
            <Typography
              variant="overline"
              sx={{
                color: "primary.main",
                fontWeight: 800,
                letterSpacing: 1.5,
              }}
            >
              FACILITY SEARCH
            </Typography>

            <Stack
              direction={{ xs: "column", sm: "row" }}
              spacing={2}
              sx={{
                mt: 1,
                alignItems: {
                  xs: "flex-start",
                  sm: "center",
                },
              }}
            >
              <Box
                sx={{
                  width: 60,
                  height: 60,
                  borderRadius: 3,
                  bgcolor: "white",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: 30,
                  boxShadow: "0 4px 16px rgba(99, 102, 241, 0.08)",
                }}
              >
                🏡
              </Box>

              <Box>
                <Typography
                  variant="h4"
                  component="h1"
                  sx={{
                    fontWeight: 800,
                    mb: 0.5,
                    fontSize: { xs: "1.6rem", sm: "2rem" },
                  }}
                >
                  介護施設検索
                </Typography>

                <Typography color="text.secondary">
                  利用者様の希望や必要なケアに合わせて、最適な施設を探しましょう。
                </Typography>
              </Box>
            </Stack>
          </Box>
        </Box>

        {/* 検索条件 */}
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              検索条件
            </Typography>

            <Stack
              spacing={2}
              sx={{
                display: "grid",
                gridTemplateColumns: {
                  xs: "1fr",
                  md: "repeat(2, minmax(0, 1fr))",
                },
                columnGap: 2,
                rowGap: 2,
                "& > *": {
                  minWidth: 0,
                  margin: "0 !important",
                },
              }}
            >
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
              <Box
                sx={{
                  gridColumn: "1 / -1",
                  mt: 1,
                }}
              >
                <Typography
                  variant="subtitle1"
                  sx={{
                    mb: 1,
                  }}
                >
                  必要な対応
                </Typography>

                <Stack
                  sx={{
                    display: "grid",
                    gridTemplateColumns: {
                      xs: "1fr",
                      sm: "repeat(2, minmax(0, 1fr))",
                    },
                    gap: 1.5,
                  }}
                >
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
                    sx={{
                      m: 0,
                      px: 1.5,
                      py: 0.5,
                      border: "1px solid",
                      borderColor: dementiaAccepted
                        ? "primary.main"
                        : "divider",
                      borderRadius: 2,
                      bgcolor: dementiaAccepted
                        ? "#F5F3FF"
                        : "background.paper",
                      transition: "background-color 0.2s, border-color 0.2s",
                      "& .MuiFormControlLabel-label": {
                        fontWeight: dementiaAccepted ? 700 : 500,
                      },
                    }}
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
                    sx={{
                      m: 0,
                      px: 1.5,
                      py: 0.5,
                      border: "1px solid",
                      borderColor: medicalCareAccepted
                        ? "primary.main"
                        : "divider",
                      borderRadius: 2,
                      bgcolor: medicalCareAccepted
                        ? "#F5F3FF"
                        : "background.paper",
                      transition: "background-color 0.2s, border-color 0.2s",
                      "& .MuiFormControlLabel-label": {
                        fontWeight: medicalCareAccepted ? 700 : 500,
                      },
                    }}
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
                    sx={{
                      m: 0,
                      px: 1.5,
                      py: 0.5,
                      border: "1px solid",
                      borderColor: wheelchairAccepted
                        ? "primary.main"
                        : "divider",
                      borderRadius: 2,
                      bgcolor: wheelchairAccepted
                        ? "#F5F3FF"
                        : "background.paper",
                      transition: "background-color 0.2s, border-color 0.2s",
                      "& .MuiFormControlLabel-label": {
                        fontWeight: wheelchairAccepted ? 700 : 500,
                      },
                    }}
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
                    sx={{
                      m: 0,
                      px: 1.5,
                      py: 0.5,
                      border: "1px solid",
                      borderColor: endOfLifeCare ? "primary.main" : "divider",
                      borderRadius: 2,
                      bgcolor: endOfLifeCare ? "#F5F3FF" : "background.paper",
                      transition: "background-color 0.2s, border-color 0.2s",
                      "& .MuiFormControlLabel-label": {
                        fontWeight: endOfLifeCare ? 700 : 500,
                      },
                    }}
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
                sx={{
                  gridColumn: "1 / -1",
                  pt: 2,
                  borderTop: "1px solid",
                  borderColor: "divider",
                }}
              >
                <Button
                  variant="contained"
                  onClick={() => {
                    void handleSearch(1);
                  }}
                  disabled={isLoading}
                  fullWidth
                  sx={{
                    minHeight: 48,
                    borderRadius: 2.5,
                    fontWeight: 700,
                    fontSize: "1rem",
                    boxShadow: "0 4px 12px rgba(99, 102, 241, 0.2)",
                    "&:hover": {
                      boxShadow: "0 6px 16px rgba(99, 102, 241, 0.3)",
                    },
                  }}
                >
                  🔍 施設を検索する
                </Button>

                <Button
                  variant="outlined"
                  onClick={handleClear}
                  disabled={isLoading}
                  fullWidth
                  sx={{
                    minHeight: 48,
                    borderRadius: 2.5,
                    fontWeight: 700,
                    fontSize: "0.95rem",
                    borderColor: "divider",
                    color: "text.secondary",
                    bgcolor: "background.paper",
                    "&:hover": {
                      borderColor: "primary.main",
                      color: "primary.main",
                      bgcolor: "#F5F3FF",
                    },
                  }}
                >
                  ↺ 条件をクリア
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

            <Stack
              direction={{ xs: "column", sm: "row" }}
              spacing={1.5}
              sx={{
                justifyContent: "space-between",
                alignItems: {
                  xs: "flex-start",
                  sm: "center",
                },
              }}
            >
              <Box>
                <Typography
                  variant="h5"
                  component="h2"
                  sx={{
                    fontWeight: 800,
                    mb: 0.5,
                  }}
                >
                  🏡 検索結果
                </Typography>

                <Typography variant="body2" color="text.secondary">
                  条件に一致する介護施設の一覧です。
                </Typography>
              </Box>

              <Chip
                label={`${result.total}件の施設が見つかりました`}
                color="primary"
                variant="outlined"
                sx={{
                  fontWeight: 700,
                  borderRadius: 2,
                  height: 34,
                  bgcolor: "#EEF2FF",
                }}
              />
            </Stack>

            {result.items.length === 0 ? (
              <Alert severity="info">条件に一致する施設はありません。</Alert>
            ) : (
              result.items.map((facility) => (
                <Card
                  key={facility.facilityId}
                  variant="outlined"
                  sx={{
                    borderRadius: 3,
                    borderColor: "divider",
                    bgcolor: "background.paper",
                    overflow: "hidden",
                    transition: "transform 0.2s ease, box-shadow 0.2s ease",
                    "&:hover": {
                      transform: "translateY(-2px)",
                      boxShadow: "0 8px 24px rgba(99, 102, 241, 0.10)",
                      borderColor: "primary.light",
                    },
                  }}
                >
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
                          <Box sx={{ minWidth: 0, flex: 1 }}>
                            <Typography
                              variant="h6"
                              component="h2"
                              sx={{
                                fontWeight: 800,
                                fontSize: { xs: "1.05rem", sm: "1.2rem" },
                                lineHeight: 1.5,
                                overflowWrap: "anywhere",
                                mb: 0.75,
                              }}
                            >
                              🏡 {facility.name}
                            </Typography>

                            <Typography
                              variant="body2"
                              sx={{
                                color: "text.secondary",
                                fontWeight: 500,
                              }}
                            >
                              {facility.facilityType?.name ?? "施設種別未登録"}
                            </Typography>
                          </Box>

                          {facility.availability && (
                            <Chip
                              label={getAvailabilityLabel(
                                facility.availability.status,
                              )}
                              size="small"
                              color={
                                facility.availability.status === "AVAILABLE"
                                  ? "success"
                                  : facility.availability.status === "FEW"
                                    ? "warning"
                                    : "default"
                              }
                              variant={
                                facility.availability.status === "FULL"
                                  ? "outlined"
                                  : "filled"
                              }
                              sx={{
                                fontWeight: 700,
                                borderRadius: 2,
                                px: 0.5,
                                flexShrink: 0,
                              }}
                            />
                          )}
                        </Box>

                        <Stack
                          direction="row"
                          spacing={1}
                          sx={{
                            alignItems: "flex-start",
                          }}
                        >
                          <Typography
                            component="span"
                            sx={{
                              fontSize: "1rem",
                              lineHeight: 1.6,
                              flexShrink: 0,
                            }}
                          >
                            📍
                          </Typography>

                          <Typography
                            variant="body2"
                            sx={{
                              color: "text.secondary",
                              lineHeight: 1.8,
                              overflowWrap: "anywhere",
                            }}
                          >
                            {facility.address ?? facility.area}
                          </Typography>
                        </Stack>

                        {facility.pricing && (
                          <Box
                            sx={{
                              bgcolor: "#F7F8FC",
                              borderRadius: 2,
                              px: 2,
                              py: 1.5,
                            }}
                          >
                            <Typography
                              variant="caption"
                              sx={{
                                color: "text.secondary",
                                fontWeight: 600,
                                display: "block",
                                mb: 0.5,
                              }}
                            >
                              💰 月額利用料金
                            </Typography>

                            <Typography
                              sx={{
                                color: "primary.main",
                                fontWeight: 800,
                                fontSize: { xs: "1rem", sm: "1.15rem" },
                                overflowWrap: "anywhere",
                              }}
                            >
                              {facility.pricing.monthlyCostMin.toLocaleString()}
                              円{" 〜 "}
                              {facility.pricing.monthlyCostMax.toLocaleString()}
                              円
                            </Typography>
                          </Box>
                        )}

                        {facility.availability && (
                          <Stack
                            direction="row"
                            spacing={1}
                            sx={{
                              alignItems: "center",
                              px: 1.5,
                              py: 1,
                              bgcolor: "#F0FDF9",
                              borderRadius: 2,
                              width: "fit-content",
                              maxWidth: "100%",
                            }}
                          >
                            <Typography sx={{ fontSize: "1rem" }}>
                              🛏️
                            </Typography>

                            <Typography
                              variant="body2"
                              sx={{
                                color: "text.secondary",
                                fontWeight: 600,
                              }}
                            >
                              空き数
                            </Typography>

                            <Typography
                              sx={{
                                color: "success.dark",
                                fontWeight: 800,
                                fontSize: "1rem",
                              }}
                            >
                              {facility.availability.availableCount == null
                                ? "未確認"
                                : `${facility.availability.availableCount}床`}
                            </Typography>
                          </Stack>
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
                              <Chip
                                label="🧠 認知症対応"
                                size="small"
                                sx={{
                                  bgcolor: "#EEF2FF",
                                  color: "#4F46E5",
                                  fontWeight: 700,
                                  borderRadius: 2,
                                  height: 30,
                                  "& .MuiChip-label": {
                                    px: 1.5,
                                  },
                                }}
                              />
                            )}

                            {facility.requirement.medicalCareAccepted && (
                              <Chip
                                label="🩺 医療ケア対応"
                                size="small"
                                sx={{
                                  bgcolor: "#E8F7F5",
                                  color: "#00897B",
                                  fontWeight: 700,
                                  borderRadius: 2,
                                  height: 30,
                                  "& .MuiChip-label": {
                                    px: 1.5,
                                  },
                                }}
                              />
                            )}

                            {facility.requirement.wheelchairAccepted && (
                              <Chip
                                label="♿ 車椅子対応"
                                size="small"
                                sx={{
                                  bgcolor: "#FFF1EC",
                                  color: "#E76F51",
                                  fontWeight: 700,
                                  borderRadius: 2,
                                  height: 30,
                                  "& .MuiChip-label": {
                                    px: 1.5,
                                  },
                                }}
                              />
                            )}

                            {facility.requirement.endOfLifeCare && (
                              <Chip
                                label="🌸 看取り対応"
                                size="small"
                                sx={{
                                  bgcolor: "#FCE7F3",
                                  color: "#BE185D",
                                  fontWeight: 700,
                                  borderRadius: 2,
                                  height: 30,
                                  "& .MuiChip-label": {
                                    px: 1.5,
                                  },
                                }}
                              />
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
