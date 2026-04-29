import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
  ].filter(Boolean),

  // Tauri expects the dev server on all interfaces so the webview can reach it
  clearScreen: false,
  server: {
    host: process.env.TAURI_DEV_HOST || false,
    port: 5173,
    strictPort: true,
    proxy: {
      '/.netlify/functions/chat': {
        target: 'http://localhost:9898',
        changeOrigin: true,
      },
    },
  },
  build: {
    chunkSizeWarningLimit: 600,
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (
            id.includes('react-markdown') ||
            id.includes('remark-gfm') ||
            id.includes('rehype-highlight') ||
            id.includes('highlight.js')
          ) {
            return 'preview-vendor'
          }
        },
      },
    },
  },
})
