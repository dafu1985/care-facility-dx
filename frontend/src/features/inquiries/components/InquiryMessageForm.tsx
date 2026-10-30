import { Box, Button, Stack, TextField } from "@mui/material";

type InquiryMessageFormProps = {
  messageBody: string;
  onMessageBodyChange: (value: string) => void;
  onSendMessage: () => void;
  isSending: boolean;
};

/**
 * 問い合わせ返信フォーム。
 *
 * 入力欄と送信ボタンの表示を担当する。
 * API通信や送信後の状態更新は親画面で行う。
 */
export function InquiryMessageForm({
  messageBody,
  onMessageBodyChange,
  onSendMessage,
  isSending,
}: InquiryMessageFormProps) {
  return (
    <Stack spacing={2.5}>
      <TextField
        label="メッセージ"
        value={messageBody}
        onChange={(event) => onMessageBodyChange(event.target.value)}
        placeholder="返信内容を入力してください"
        multiline
        minRows={4}
        fullWidth
        sx={{
          "& .MuiOutlinedInput-root": {
            borderRadius: 2.5,
            bgcolor: "#F8FAFC",
            alignItems: "flex-start",
          },
        }}
      />

      <Box
        sx={{
          display: "flex",
          justifyContent: "flex-end",
        }}
      >
        <Button
          variant="contained"
          onClick={onSendMessage}
          disabled={isSending || messageBody.trim() === ""}
          sx={{
            minWidth: { xs: "100%", sm: 180 },
            minHeight: 44,
            borderRadius: 2.5,
            px: 3,
            fontWeight: 800,
            textTransform: "none",
            bgcolor: "#6366F1",
            boxShadow: "0 4px 12px rgba(99, 102, 241, 0.15)",
            "&:hover": {
              bgcolor: "#4F46E5",
              boxShadow: "0 6px 16px rgba(99, 102, 241, 0.2)",
            },
          }}
        >
          {isSending ? "送信中..." : "返信を送信"}
        </Button>
      </Box>
    </Stack>
  );
}
