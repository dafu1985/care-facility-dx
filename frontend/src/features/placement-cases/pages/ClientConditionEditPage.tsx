import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Container,
  FormControl,
  FormControlLabel,
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
          <Typography variant="h5" component="h1">
            利用者条件
          </Typography>

          <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
            施設マッチングに使用する利用者の希望条件を入力します。
          </Typography>
        </Box>

        {error && <Alert severity="error">{error}</Alert>}

        <Card>
          <CardContent>
            <Stack spacing={3}>
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

              <Stack spacing={1}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={publicAssistance}
                      onChange={(event) => {
                        setPublicAssistance(event.target.checked);
                      }}
                    />
                  }
                  label="生活保護を利用している"
                />

                <FormControlLabel
                  control={
                    <Switch
                      checked={guarantorAvailable}
                      onChange={(event) => {
                        setGuarantorAvailable(event.target.checked);
                      }}
                    />
                  }
                  label="身元保証人がいる"
                />

                <FormControlLabel
                  control={
                    <Switch
                      checked={dementia}
                      onChange={(event) => {
                        setDementia(event.target.checked);
                      }}
                    />
                  }
                  label="認知症あり"
                />

                <FormControlLabel
                  control={
                    <Switch
                      checked={endOfLifeCare}
                      onChange={(event) => {
                        setEndOfLifeCare(event.target.checked);
                      }}
                    />
                  }
                  label="看取り対応を希望する"
                />
              </Stack>
            </Stack>
          </CardContent>
        </Card>

        <Box
          sx={{
            display: "flex",
            justifyContent: "flex-end",
            gap: 2,
          }}
        >
          <Button
            variant="outlined"
            disabled={isSubmitting}
            onClick={() => {
              navigate(`/placement-cases/${placementCaseId}`);
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
          >
            {isSubmitting ? "保存中..." : "利用者条件を保存"}
          </Button>
        </Box>
      </Stack>
    </Container>
  );
}