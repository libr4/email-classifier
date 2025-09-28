  import { Box, Paper, Stack, Chip, Typography, Tooltip, IconButton, FormControl, InputLabel, Select, MenuItem } from "@mui/material";
  import ContentCopyIcon from "@mui/icons-material/ContentCopy";
  import ThumbUpAltOutlinedIcon from "@mui/icons-material/ThumbUpAltOutlined";
  import ThumbDownAltOutlinedIcon from "@mui/icons-material/ThumbDownAltOutlined";
  import { formatScore } from "utils/text";
  import type { BotBubbleResult, ReasonCode, TelemetryState } from "types";
  import { useState } from "react";
  import { postFeedback } from "utils/api";

  export function BotBubble({ b, telemetry }: { b: BotBubbleResult; telemetry: TelemetryState }) {
    const [copied, setCopied] = useState(false);
    const [sending, setSending] = useState(false);
    const [reason, setReason] = useState<ReasonCode | "">("");

    const suggestion = b.result.suggestion ?? "Sem sugestão para este item.";

    const doCopy = async () => {
      try {
        await navigator.clipboard.writeText(suggestion);
        setCopied(true);
        setTimeout(() => setCopied(false), 1200);
      } catch {}
    };

    const sendFeedback = async (helpful: boolean) => {
      if (telemetry !== "ready") return;
      try {
        setSending(true);
        await postFeedback(b.result.classification_id, helpful, helpful ? undefined : reason || undefined);
        setSending(false);
      } catch (e) {
        setSending(false);
      }
    };

    return (
      <Box sx={{ display: "flex", justifyContent: "flex-end", my: 1 }}>
        <Paper sx={{ p: 1.5, maxWidth: "70%", backgroundColor: (t) => t.palette.grey[50] }} variant="outlined">
          <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 0.5 }}>
            <Chip size="small" color={b.result.label === "Produtivo" ? "success" : "default"} label={b.result.label} />
            <Chip size="small" variant="outlined" label={`Score ${formatScore(b.result.score_produtivo)}`} />
        </Stack>
        <Typography sx={{ whiteSpace: "pre-wrap", mb: 1 }}>{suggestion}</Typography>
        <Stack direction="row" spacing={1} alignItems="center">
          <Tooltip title={copied ? "Copiado!" : "Copiar sugestão"}>
            <span>
              <IconButton size="small" onClick={doCopy} aria-label="copiar">
                <ContentCopyIcon fontSize="small" />
              </IconButton>
            </span>
          </Tooltip>

          <Tooltip title={telemetry === "ready" ? "Útil" : "Feedback indisponível"}>
            <span>
              <IconButton size="small" disabled={telemetry !== "ready" || sending} onClick={() => sendFeedback(true)} aria-label="útil">
                <ThumbUpAltOutlinedIcon fontSize="small" />
              </IconButton>
            </span>
          </Tooltip>

          <Tooltip title={telemetry === "ready" ? "Não útil" : "Feedback indisponível"}>
            <span>
              <IconButton size="small" disabled={telemetry !== "ready" || sending} aria-label="não útil">
                <ThumbDownAltOutlinedIcon fontSize="small" />
              </IconButton>
            </span>
          </Tooltip>

          {telemetry === "ready" && (
            <FormControl size="small" sx={{ minWidth: 180 }}>
              <InputLabel id={`reason-${b.id}`}>Motivo</InputLabel>
              <Select
                labelId={`reason-${b.id}`}
                label="Motivo"
                value={reason}
                onChange={(e) => setReason(e.target.value as ReasonCode | "")}
                displayEmpty
              >
                <MenuItem value="">(opcional)</MenuItem>
                <MenuItem value="WRONG_INTENT">Assunto errado</MenuItem>
                <MenuItem value="TONE">Tom inadequado</MenuItem>
                <MenuItem value="MISSING_INFO">Faltou informação</MenuItem>
                <MenuItem value="LOW_CONF">Confiança baixa</MenuItem>
                <MenuItem value="OTHER">Outro</MenuItem>
              </Select>
            </FormControl>
          )}
        </Stack>
      </Paper>
    </Box>
  );
}
