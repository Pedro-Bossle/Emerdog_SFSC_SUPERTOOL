import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig(({ command }) => ({
  // Dev local sempre na raiz. Em build, usa base do Vercel ou do GitHub Pages.
  base: command === 'serve'
    ? '/'
    : (process.env.VERCEL ? '/' : '/Emerdog_SFSC_SUPERTOOL/'),
  plugins: [react()],
  server: {
    proxy: {
      '/api': 'http://localhost:3000',
    },
  },
}))
