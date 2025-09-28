  import { Badge, Box, Chip, IconButton, LinearProgress, Stack, TextField, Tooltip } from "@mui/material";
  import AttachFileIcon from "@mui/icons-material/AttachFile";
  import SendIcon from "@mui/icons-material/Send";

  export function Composer({ files, typed, sending, MAX_ATTACH, onAttach, onRemoveFile, onChangeText, onSend, onKeyDown } : {
  files: { name: string }[];
  typed: string;
  sending: boolean;
  MAX_ATTACH: number;
  onAttach: (files: FileList | null) => void;
  onRemoveFile: (idx: number) => void;
  onChangeText: (v: string) => void;
  onSend: () => void;
  onKeyDown: (e: React.KeyboardEvent<HTMLDivElement>) => void;
}) {
  return (
    <Box sx={{ py: 1, position: "sticky", bottom: 0, background: (t) => t.palette.background.paper }}>
      {files.length > 0 && (
        <Box
          sx={{
            mb: 0.5,
            display: 'flex', alignItems: 'center', gap: 0.5,
            overflowX: 'auto', whiteSpace: 'nowrap', px: 1,
          }}
        >
          {files.map((f, i) => (
            <Chip key={f.name + i} label={f.name} size="small" onDelete={() => onRemoveFile(i)} sx={{ mr: 0.5 }} />
          ))}
        </Box>
      )}
      <Stack direction="row" spacing={1} alignItems="center">
        <Badge badgeContent={`${files.length}/${MAX_ATTACH}`} color="primary">
          <IconButton component="label" color="default" disabled={sending} sx={{ width: 48, height: 48 }} aria-label="anexar .txt">
            <AttachFileIcon />
            <input hidden multiple accept=".txt,text/plain" type="file" onChange={(e) => onAttach(e.target.files)} />
          </IconButton>
        </Badge>
        <TextField
          fullWidth size="small" multiline minRows={1} maxRows={6}
          placeholder="Cole seu email aqui…"
          value={typed}
          onChange={(e) => onChangeText(e.target.value)}
          onKeyDown={onKeyDown}
          sx={{ '& .MuiOutlinedInput-root': { alignItems: 'center' } }}
        />
        <Tooltip title="Enviar (Enter)"><span>
          <IconButton color="primary" onClick={onSend} disabled={sending} sx={{ width: 48, height: 48 }} aria-label="enviar">
            <SendIcon />
          </IconButton>
        </span></Tooltip>
      </Stack>
      {sending && (<Box sx={{ mt: 1 }}><LinearProgress /></Box>)}
    </Box>
  );
}
