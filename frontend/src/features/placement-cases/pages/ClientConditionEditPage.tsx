import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Container,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  Stack,
  Switch,
  TextField,
  Typography,
} from "@mui/material";
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import { getClientCondition } from "../api/get-client-condition";
import { upsertClientCondition } from "../api/upsert-client-condition";

/**
 * 利用者条件の登録・編集画面。
 */
export function ClientConditionEditPage() {
  const navigate = useNavigate();
  const { placementCaseId } = useParams<{ placementCaseId: string }>();

  const [ageGroup, setAgeGroup] = useState("");
  const [gender, setGender] = useState("");
  const [careLevel, setCareLevel] = useState("");
  const [budgetMax, setBudgetMax] = useState("");
  const [desiredArea, setDesiredArea] = useState("");
  const [publicAssistance, setPublicAssistance] = useState(false);
  const [guarantorAvailable, setGuarantorAvailable] = useState(false);
  const [dementia, setDementia] = useState(false);
  const [endOfLifeCare, setEndOfLifeCare] = useState(false);
  const [desiredMoveInDate, setDesiredMoveInDate] = useState("");

  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /**
   * 既存の利用者条件がある場合はフォームへ反映する。
   */
  useEffect(() => {
    if (!placementCaseId) {
      setError("案件IDを取得できませんでした。");
      setIsLoading(false);
      return;
    }

    let cancelled = false;

    getClientCondition(placementCaseId)
      .then((condition) => {
        if (cancelled || !condition) {
          return;
        }

        setAgeGroup(condition.ageGroup ?? "");
        setGender(condition.gender ?? "");
        setCareLevel(condition.careLevel ?? "");
        setBudgetMax(
          condition.budgetMax === null ? "" : String(condition.budgetMax),
        );
        setDesiredArea(condition.desiredArea ?? "");
        setPublicAssistance(condition.publicAssistance);
        setGuarantorAvailable(condition.guarantorAvailable);
        setDementia(condition.dementia);
        setEndOfLifeCare(condition.endOfLifeCare);
        setDesiredMoveInDate(condition.desiredMoveInDate ?? "");
      })
      .catch((error) => {
        if (cancelled) {
          return;
        }

        console.error("利用者条件の取得に失敗しました。", error);
        setError("利用者条件の取得に失敗しました。");
      })
      .finally(() => {
        if (!cancelled) {
          setIsLoading(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [placementCaseId]);

  /**
   * 利用者条件を登録・更新する。
   */
  async function handleSubmit() {
    if (!placementCaseId || isSubmitting) {
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      await upsertClientCondition(placementCaseId, {
        ageGroup: ageGroup || undefined,
        gender: gender || undefined,
        careLevel: careLevel || undefined,
        budgetMax: budgetMax === "" ? undefined : Number(budgetMax),
        desiredArea: desiredArea.trim() || undefined,
        publicAssistance,
        guarantorAvailable,
        dementia,
        endOfLifeCare,
        desiredMoveInDate: desiredMoveInDate || undefined,
      });

      navigate(`/placement-cases/${placementCaseId}`, {
        replace: true,
      });
    } catch (error) {
      console.error("利用者条件の保存に失敗しました。", error);
      setError(
        "利用者条件の保存に失敗しました。入力内容を確認して再度お試しください。",
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  if (isLoading) {
    return (
      <Container maxWidth="md" sx={{ py: 4 }}>
        <Typography>読み込み中...</Typography>
      </Container>
    );
  }

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Stack spacing={3}>
        <Box>
          <Button
            variant="text"
            onClick={() => {
              navigate(`/placement-cases/${placementCaseId}`);
            }}
            sx={{
              mb: 2,
              px: 0,
              minWidth: 0,
              color: "text.secondary",
              fontWeight: 700,
              "&:hover": {
                bgcolor: "transparent",
                color: "primary.main",
              },
            }}
          >
            ← 案件詳細へ戻る
          </Button>

          <Box
            sx={{
              position: "relative",
              overflow: "hidden",
              borderRadius: 4,
              p: {
                xs: 3,
                md: 4,
              },
              background:
                "linear-gradient(135deg, #EEF2FF 0%, #FFF1EC 55%, #E8F7F5 100%)",
            }}
          >
            <Box
              sx={{
                position: "absolute",
                top: -50,
                right: -30,
                width: 160,
                height: 160,
                borderRadius: "50%",
                bgcolor: "rgba(255, 255, 255, 0.55)",
              }}
            />

            <Stack
              direction={{
                xs: "column",
                sm: "row",
              }}
              spacing={2}
              sx={{
                position: "relative",
                alignItems: {
                  xs: "flex-start",
                  sm: "center",
                },
              }}
            >
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  width: 56,
                  height: 56,
                  borderRadius: 3,
                  bgcolor: "rgba(255, 255, 255, 0.8)",
                  fontSize: 28,
                  boxShadow: "0 8px 24px rgba(99, 102, 241, 0.12)",
                  flexShrink: 0,
                }}
              >
                👤
              </Box>

              <Box>
                <Typography
                  variant="overline"
                  sx={{
                    color: "primary.main",
                    fontWeight: 800,
                    letterSpacing: "0.12em",
                  }}
                >
                  CLIENT CONDITION
                </Typography>

                <Typography
                  variant="h4"
                  component="h1"
                  sx={{
                    mt: 0.25,
                    fontWeight: 800,
                    letterSpacing: "-0.02em",
                  }}
                >
                  利用者条件
                </Typography>

                <Typography
                  variant="body1"
                  color="text.secondary"
                  sx={{
                    mt: 1,
                    maxWidth: 620,
                  }}
                >
                  施設マッチングに使用する利用者の希望条件を入力します。
                </Typography>
              </Box>
            </Stack>
          </Box>
        </Box>

        {error && <Alert severity="error">{error}</Alert>}

        <Card
          sx={{
            border: "1px solid",
            borderColor: "divider",
            boxShadow: "0 10px 30px rgba(15, 23, 42, 0.05)",
          }}
        >
          <CardContent
            sx={{
              p: {
                xs: 2.5,
                md: 4,
              },
              "&:last-child": {
                pb: {
                  xs: 2.5,
                  md: 4,
                },
              },
            }}
          >
            <Stack spacing={3}>
              <Box>
                <Typography
                  variant="h6"
                  sx={{
                    fontWeight: 800,
                    display: "flex",
                    alignItems: "center",
                    gap: 1,
                  }}
                >
                  📝 基本情報
                </Typography>

                <Typography
                  variant="body2"
                  color="text.secondary"
                  sx={{ mt: 0.5 }}
                >
                  年代や要介護度、予算、希望地域などを設定します。
                </Typography>
              </Box>
              <Box
                sx={{
                  display: "grid",
                  gridTemplateColumns: {
                    xs: "1fr",
                    md: "repeat(3, 1fr)",
                  },
                  gap: 2,
                }}
              >
                <FormControl fullWidth>
                  <InputLabel id="client-condition-age-group-label">
                    年代
                  </InputLabel>

                  <Select
                    labelId="client-condition-age-group-label"
                    value={ageGroup}
                    label="年代"
                    onChange={(event) => {
                      setAgeGroup(event.target.value);
                    }}
                  >
                    <MenuItem value="">未設定</MenuItem>
                    <MenuItem value="60s">60代</MenuItem>
                    <MenuItem value="70s">70代</MenuItem>
                    <MenuItem value="80s">80代</MenuItem>
                    <MenuItem value="90s">90代</MenuItem>
                    <MenuItem value="100s">100歳以上</MenuItem>
                  </Select>
                </FormControl>

                <FormControl fullWidth>
                  <InputLabel id="client-condition-gender-label">
                    性別
                  </InputLabel>

                  <Select
                    labelId="client-condition-gender-label"
                    value={gender}
                    label="性別"
                    onChange={(event) => {
                      setGender(event.target.value);
                    }}
                  >
                    <MenuItem value="">未設定</MenuItem>
                    <MenuItem value="MALE">男性</MenuItem>
                    <MenuItem value="FEMALE">女性</MenuItem>
                    <MenuItem value="OTHER">その他</MenuItem>
                  </Select>
                </FormControl>

                <FormControl fullWidth>
                  <InputLabel id="client-condition-care-level-label">
                    要介護度
                  </InputLabel>

                  <Select
                    labelId="client-condition-care-level-label"
                    value={careLevel}
                    label="要介護度"
                    onChange={(event) => {
                      setCareLevel(event.target.value);
                    }}
                  >
                    <MenuItem value="">未設定</MenuItem>
                    <MenuItem value="INDEPENDENT">自立</MenuItem>
                    <MenuItem value="SUPPORT_1">要支援1</MenuItem>
                    <MenuItem value="SUPPORT_2">要支援2</MenuItem>
                    <MenuItem value="CARE_1">要介護1</MenuItem>
                    <MenuItem value="CARE_2">要介護2</MenuItem>
                    <MenuItem value="CARE_3">要介護3</MenuItem>
                    <MenuItem value="CARE_4">要介護4</MenuItem>
                    <MenuItem value="CARE_5">要介護5</MenuItem>
                  </Select>
                </FormControl>
              </Box>

              <Box
                sx={{
                  display: "grid",
                  gridTemplateColumns: {
                    xs: "1fr",
                    md: "repeat(3, 1fr)",
                  },
                  gap: 2,
                }}
              >
                <TextField
                  label="月額予算上限"
                  type="number"
                  value={budgetMax}
                  onChange={(event) => {
                    setBudgetMax(event.target.value);
                  }}
                  slotProps={{
                    htmlInput: {
                      min: 0,
                    },
                  }}
                  helperText="円単位で入力してください。"
                  fullWidth
                />

                <TextField
                  label="希望地域"
                  value={desiredArea}
                  onChange={(event) => {
                    setDesiredArea(event.target.value);
                  }}
                  placeholder="例：新潟市江南区"
                  fullWidth
                />

                <TextField
                  label="入居希望日"
                  type="date"
                  value={desiredMoveInDate}
                  onChange={(event) => {
                    setDesiredMoveInDate(event.target.value);
                  }}
                  slotProps={{
                    inputLabel: {
                      shrink: true,
                    },
                  }}
                  fullWidth
                />
              </Box>

              <Box
                sx={{
                  mt: 1,
                  p: {
                    xs: 2,
                    md: 3,
                  },
                  borderRadius: 3,
                  bgcolor: "background.default",
                  border: "1px solid",
                  borderColor: "divider",
                }}
              >
                <Typography
                  variant="subtitle1"
                  sx={{
                    fontWeight: 800,
                    mb: 0.5,
                  }}
                >
                  ✨ その他の条件
                </Typography>

                <Typography
                  variant="body2"
                  color="text.secondary"
                  sx={{ mb: 2 }}
                >
                  施設選びやマッチングに関係する追加条件を設定します。
                </Typography>

                <Stack spacing={1}>
                  <Box
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      gap: 2,
                      px: 2,
                      py: 1.5,
                      borderRadius: 2.5,
                      bgcolor: "background.paper",
                    }}
                  >
                    <Box>
                      <Typography variant="body1" sx={{ fontWeight: 700 }}>
                        🏠 生活保護
                      </Typography>

                      <Typography variant="body2" color="text.secondary">
                        生活保護を利用している場合に有効にします。
                      </Typography>
                    </Box>

                    <Switch
                      checked={publicAssistance}
                      onChange={(event) => {
                        setPublicAssistance(event.target.checked);
                      }}
                    />
                  </Box>

                  <Box
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      gap: 2,
                      px: 2,
                      py: 1.5,
                      borderRadius: 2.5,
                      bgcolor: "background.paper",
                    }}
                  >
                    <Box>
                      <Typography variant="body1" sx={{ fontWeight: 700 }}>
                        🤝 身元保証人
                      </Typography>

                      <Typography variant="body2" color="text.secondary">
                        身元保証人がいる場合に有効にします。
                      </Typography>
                    </Box>

                    <Switch
                      checked={guarantorAvailable}
                      onChange={(event) => {
                        setGuarantorAvailable(event.target.checked);
                      }}
                    />
                  </Box>

                  <Box
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      gap: 2,
                      px: 2,
                      py: 1.5,
                      borderRadius: 2.5,
                      bgcolor: "background.paper",
                    }}
                  >
                    <Box>
                      <Typography variant="body1" sx={{ fontWeight: 700 }}>
                        🧠 認知症
                      </Typography>

                      <Typography variant="body2" color="text.secondary">
                        認知症への対応が必要な場合に有効にします。
                      </Typography>
                    </Box>

                    <Switch
                      checked={dementia}
                      onChange={(event) => {
                        setDementia(event.target.checked);
                      }}
                    />
                  </Box>

                  <Box
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      gap: 2,
                      px: 2,
                      py: 1.5,
                      borderRadius: 2.5,
                      bgcolor: "background.paper",
                    }}
                  >
                    <Box>
                      <Typography variant="body1" sx={{ fontWeight: 700 }}>
                        🌙 看取り対応
                      </Typography>

                      <Typography variant="body2" color="text.secondary">
                        看取りまで対応できる施設を希望する場合に有効にします。
                      </Typography>
                    </Box>

                    <Switch
                      checked={endOfLifeCare}
                      onChange={(event) => {
                        setEndOfLifeCare(event.target.checked);
                      }}
                    />
                  </Box>
                </Stack>
              </Box>
            </Stack>
          </CardContent>
        </Card>

        <Box
          sx={{
            display: "flex",
            flexDirection: {
              xs: "column-reverse",
              sm: "row",
            },
            justifyContent: "flex-end",
            gap: 1.5,
            pt: 1,
          }}
        >
          <Button
            variant="outlined"
            disabled={isSubmitting}
            onClick={() => {
              navigate(`/placement-cases/${placementCaseId}`);
            }}
            sx={{
              minWidth: {
                sm: 120,
              },
              minHeight: 46,
              fontWeight: 700,
            }}
          >
            キャンセル
          </Button>

          <Button
            variant="contained"
            disabled={isSubmitting || !placementCaseId}
            onClick={() => {
              void handleSubmit();
            }}
            sx={{
              minWidth: {
                sm: 180,
              },
              minHeight: 46,
              fontWeight: 800,
              boxShadow: "0 8px 20px rgba(99, 102, 241, 0.22)",
              "&:hover": {
                boxShadow: "0 10px 24px rgba(99, 102, 241, 0.28)",
              },
            }}
          >
            {isSubmitting ? "保存中..." : "✓ 利用者条件を保存"}
          </Button>
        </Box>
      </Stack>
    </Container>
  );
}
