import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// Uses relative base so it works seamlessly locally, on GitHub Pages (/System-Design-Compelte-Guide/), or Vercel
export default defineConfig({
  plugins: [react()],
  base: './',
  build: {
    outDir: 'dist',
    sourcemap: false,
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom', 'lucide-react'],
          hldData: [
            './src/data/modules01_02.js',
            './src/data/module03_data.js',
            './src/data/modules04_05.js',
            './src/data/modules06_09.js',
            './src/data/module10_hld_systems.js',
            './src/data/module13_in_the_wild.js',
          ],
          lldData: [
            './src/data/gofPatterns23.js',
            './src/data/module11_lld_core.js',
            './src/data/module12_lld_systems.js',
            './src/data/practiceAndCheatsheets.js',
          ],
        },
      },
    },
  },
})
