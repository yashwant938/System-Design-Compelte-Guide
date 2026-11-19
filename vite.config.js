import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// Uses relative base so it works seamlessly locally, on GitHub Pages (/System-Design-Compelte-Guide/), or Vercel
export default defineConfig({
  plugins: [react()],
  base: './',
  build: {
    outDir: 'dist',
    sourcemap: false,
  },
})
