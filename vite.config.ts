import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    host: '0.0.0.0',
    headers: {
      'X-Frame-Options': 'DENY',
      'Content-Security-Policy': "default-src 'self'; base-uri 'self'; frame-ancestors 'none'; img-src 'self' data: blob:; font-src 'self' data: https://r2cdn.perplexity.ai; style-src 'self' 'unsafe-inline'; script-src 'self' 'unsafe-inline' 'unsafe-eval' blob:; connect-src 'self' http://localhost:4000 ws://localhost:5173 http://localhost:5173 http://192.168.2.24:4000 ws://192.168.2.24:5173 http://192.168.2.24:5173; object-src 'none'; worker-src 'self' blob:; frame-src 'none'",
    },
    proxy: {
      '/api': {
        target: 'http://localhost:4000',
        changeOrigin: true,
        secure: false,
      },
    },
  },
})
 