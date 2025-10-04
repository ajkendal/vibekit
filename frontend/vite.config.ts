import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api': {
        target: 'http://127.0.0.1:52754',
        changeOrigin: true,
        // 👇 critical: strip the /api prefix before hitting the Worker
        rewrite: (path) => path.replace(/^\/api/, ''),
      },
    },
  },
})
