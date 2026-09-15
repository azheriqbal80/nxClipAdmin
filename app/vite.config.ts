import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import path from 'node:path'

// Live gateway — dev proxy forwards /auth and /admin here so the browser
// stays same-origin (localhost:5173) and never trips CORS. Backend must add
// real CORS for the deployed SPA origin before we run without this proxy.
const GATEWAY = 'https://api-gateway-216098834386.us-central1.run.app'

// https://vite.dev/config/
export default defineConfig({
  base: process.env.GITHUB_PAGES === 'true' ? '/nxClipAdmin/' : '/',
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    proxy: {
      '/auth': { target: GATEWAY, changeOrigin: true, secure: true },
      '/admin': { target: GATEWAY, changeOrigin: true, secure: true },
      // Authenticated content media (`/content/:id/media`) — proxied so the
      // inspector can fetch it same-origin with the Bearer header.
      '/content': { target: GATEWAY, changeOrigin: true, secure: true },
    },
  },
})
