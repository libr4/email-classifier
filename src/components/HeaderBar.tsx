import { AppBar, Toolbar, Typography, Box, Stack, Chip, Tooltip, Button, IconButton } from "@mui/material";
import DeleteSweepIcon from "@mui/icons-material/DeleteSweep";
import type { Healthz } from "types";

export function HeaderBar({ health, onClear }: { health: Healthz | null; onClear: () => void }) {
  return (
    <AppBar position="sticky" color="default" elevation={0} sx={{ borderBottom: 1, borderColor: "divider" }}>
      <Toolbar sx={{ p: 1 }}>
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: '1fr auto 1fr',
            alignItems: 'center',
            width: '100%',
            gap: 1,
          }}
        >
          <Box />
          <Typography variant="h6" sx={{ textAlign: 'center' }}>
            Auto Email Classifier
          </Typography>

          {/* Desktop actions */}
          <Box sx={{ justifySelf: 'end', display: { xs: 'none', sm: 'flex' }, alignItems: 'center', gap: 1 }}>
            {health && <Chip size="small" label={`Threshold: ${health.threshold}`} variant="outlined" />}
            <Tooltip title="Limpar conversa (apaga histórico desta aba)">
              <Button startIcon={<DeleteSweepIcon />} onClick={onClear} color="inherit">
                Limpar conversa
              </Button>
            </Tooltip>
          </Box>

          {/* Mobile actions */}
          <Box sx={{ justifySelf: 'end', display: { xs: 'flex', sm: 'none' }, alignItems: 'center', gap: 0.5 }}>
            {health && <Chip size="small" label={`Thr: ${health.threshold}`} variant="outlined" />}
            <Tooltip title="Limpar conversa">
              <IconButton onClick={onClear} color="inherit" aria-label="limpar conversa">
                <DeleteSweepIcon />
              </IconButton>
            </Tooltip>
          </Box>
        </Box>
      </Toolbar>
    </AppBar>
  );
}
