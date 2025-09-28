import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tsconfigPaths from 'vite-tsconfig-paths'

export default defineConfig({
  plugins: [react(), tsconfigPaths()],
  server: {
    host: '0.0.0.0',   // keeps our Windows-friendly IPv4 bind
    port: 3000,
    strictPort: true,
    open: true,
  },
})
