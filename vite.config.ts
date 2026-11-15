import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
  ],
  server: {
    proxy: {
      '/api': {
        // 127.0.0.1, not localhost: on Windows `localhost` resolves to ::1 first.
        // The API port is configurable so local dev can keep 8787 free for the
        // SSH tunnel to the EC2 node (see server/dev-local.md).
        target: `http://127.0.0.1:${process.env.API_PORT || 8787}`,
        changeOrigin: true,
      },
    },
  },
})
