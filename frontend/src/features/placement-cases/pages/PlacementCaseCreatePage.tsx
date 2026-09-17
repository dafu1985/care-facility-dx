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
  TextField,
  Typography,
} from "@mui/material";
import { useState } from "react";
import { useNavigate } from "react-router-dom";

import { createPlacementCase } from "../api/create-placement-case";

/**
 * 施設探し案件の新規作成画面。
 */
export function PlacementCaseCreatePage() {
  const navigate = useNavigate();

  const [desiredMoveInDate, setDesiredMoveInDate] = useState("");
  const [urgency, setUrgency] = useState("");
  const [note, setNote] = useState("");

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /**
   * 案件を作成する。
   */
  async function handleSubmit() {
    if (isSubmitting) {
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      const placementCase = await createPlacementCase({
        desiredMoveInDate: desiredMoveInDate || undefined,
        urgency: urgency || undefined,
        note: note.trim() || undefined,
      });

      navigate(
        `/placement-cases/${placementCase.placementCaseId}`,
        { replace: true },
      );
    } catch (error) {
      console.error("施設探し案件の作成に失敗しました。", error);

      setError(
        "施設探し案件の作成に失敗しました。入力内容を確認して再度お試しください。",
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <Container
      maxWidth="md"
      sx={{
        py: 4,
      }}
    >
      <Stack spacing={3}>
        <Box>
          <Typography variant="h5" component="h1">
            新規案件を作成
          </Typography>

          <Typography
            variant="body2"
            color="text.secondary"
            sx={{
              mt: 0.5,
            }}
          >
            施設探しを開始するための案件を作成します。
          </Typography>
        </Box>

        {error && <Alert severity="error">{error}</Alert>}

        <Card>
          <CardContent>
            <Stack spacing={3}>
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

              <FormControl fullWidth>
                <InputLabel id="placement-case-urgency-label">
                  緊急度
                </InputLabel>

                <Select
                  labelId="placement-case-urgency-label"
                  value={urgency}
                  label="緊急度"
                  onChange={(event) => {
                    setUrgency(event.target.value);
                  }}
                >
                  <MenuItem value="">
                    未設定
                  </MenuItem>

                  <MenuItem value="HIGH">
                    高
                  </MenuItem>

                  <MenuItem value="MEDIUM">
                    中
                  </MenuItem>

                  <MenuItem value="LOW">
                    低
                  </MenuItem>
                </Select>
              </FormControl>

              <TextField
                label="メモ"
                value={note}
                onChange={(event) => {
                  setNote(event.target.value);
                }}
                multiline
                minRows={4}
                placeholder="案件に関する補足事項を入力してください。"
                fullWidth
              />
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
              navigate("/placement-cases");
            }}
          >
            キャンセル
          </Button>

          <Button
            variant="contained"
            disabled={isSubmitting}
            onClick={() => {
              void handleSubmit();
            }}
          >
            {isSubmitting ? "作成中..." : "案件を作成"}
          </Button>
        </Box>
      </Stack>
    </Container>
  );
}