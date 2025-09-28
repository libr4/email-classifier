import { createTheme } from "@mui/material/styles";

export const theme = createTheme({
  palette: {
    mode: "light",
    primary: { main: "#2563eb", light: "#93c5fd", dark: "#1e40af" },
    secondary: { main: "#64748b", light: "#cbd5e1", dark: "#475569" },
    success: { main: "#16a34a" },
    background: { default: "#f7f7f8", paper: "#ffffff" },
  },
  typography: { fontSize: 14 },
  components: {
    MuiPaper: { styleOverrides: { root: { borderRadius: 12 } } },
    MuiButton: { styleOverrides: { root: { borderRadius: 12 } } },
    MuiAppBar: { styleOverrides: { root: { backgroundColor: "#ffffff" } } },
    MuiChip: { styleOverrides: { outlined: { borderColor: "#e5e7eb" } } },
  },
});
