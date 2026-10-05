import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// SITE_SET picks the project: main (USA + Canada, dist-site), uk, eu or bd (each in its own dist-<set> folder).
const SET = process.env.SITE_SET || 'main'
const OUT = SET === 'main' ? '../dist-site' : `../dist-${SET}`

// Jarz Digital USA website (homepage + city pages). Static, pre-rendered output in dist-site/.
export default defineConfig({
  root: 'site',
  publicDir: 'public',
  plugins: [react()],
  base: '/',
  resolve: { alias: { '/src': new URL('./src', import.meta.url).pathname } },
  server: { fs: { allow: ['..'] } },
  build: { outDir: OUT, emptyOutDir: true, assetsInlineLimit: 4096, cssCodeSplit: false },
})
