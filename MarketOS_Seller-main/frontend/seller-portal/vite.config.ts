import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  const target = env.VITE_API_BASE || 'https://ux95pk83o4.execute-api.ap-south-1.amazonaws.com/prod'
  return {
    plugins: [react()],
    server: {
      proxy: {
        '/api': {
          target,
          changeOrigin: true,
          secure: true,
          // IMPORTANT: DO NOT rewrite. Dev: /api/... -> Upstream: /prod/api/...
        },
      },
    },
  }
})
