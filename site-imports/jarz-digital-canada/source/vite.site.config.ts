import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// Jarz Digital USA website (homepage + city pages). Static, pre-rendered output in dist-site/.
export default defineConfig({
  root: 'site',
  publicDir: 'public',
  plugins: [react()],
  base: '/',
  resolve: { alias: { '/src': new URL('./src', import.meta.url).pathname } },
  server: { fs: { allow: ['..'] } },
  build: { outDir: '../dist-site', emptyOutDir: true, assetsInlineLimit: 4096, cssCodeSplit: false },
})
