import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  base: '/pages/zallen33/CS-6440-Final-Project/',
  build: {
    outDir: 'docs'
  }
})
