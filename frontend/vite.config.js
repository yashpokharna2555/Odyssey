import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    proxy: {
      '/api': {
        target: 'https://721inkpci4.execute-api.us-east-2.amazonaws.com',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, ''),
      },
      '/places': {
        target: 'https://places.geo.us-east-2.api.aws',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/places/, ''),
      },
    },
  },
})