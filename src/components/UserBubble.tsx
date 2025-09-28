import { Box, Paper, Typography, Divider, Stack } from "@mui/material";
import type { UserMessage } from "types";

export function UserBubble({ msg }: { msg: UserMessage }) {
  return (
    <Box sx={{ display: "flex", justifyContent: "flex-start", my: 1 }}>
      <Paper sx={{ p: 1.5, maxWidth: "70%" }} variant="outlined">
        <Typography variant="caption" color="text.secondary">
          Você · {new Date(msg.ts).toLocaleTimeString()}
        </Typography>
        {msg.typedText && (
          <Typography sx={{ whiteSpace: "pre-wrap", mt: 0.5 }}>{msg.typedText}</Typography>
        )}
        {msg.files.length > 0 && (
          <Box sx={{ mt: 1 }}>
            <Divider sx={{ mb: 1 }} />
            <Typography variant="caption" color="text.secondary">
              Anexos:
            </Typography>
            <Stack spacing={0.5} sx={{ mt: 0.5 }}>
              {msg.files.map((f) => (
                <Paper key={f.name + msg.id} sx={{ p: 0.75 }} variant="outlined">
                  <Typography variant="body2" sx={{ fontWeight: 600 }}>
                    {f.name}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {f.preview}
                  </Typography>
                </Paper>
              ))}
            </Stack>
          </Box>
        )}
      </Paper>
    </Box>
  );
}
