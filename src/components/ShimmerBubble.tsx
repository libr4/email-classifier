import { Box, Paper } from "@mui/material";

export function ShimmerBubble() {
  return (
    <Box sx={{ display: "flex", justifyContent: "flex-end", my: 1 }}>
      <Paper sx={{ p: 1.5, maxWidth: "70%", position: "relative", overflow: "hidden" }} variant="outlined">
        <Box className="shimmer" sx={{ width: "100%", height: 64, borderRadius: 1 }} />
      </Paper>
    </Box>
  );
}
