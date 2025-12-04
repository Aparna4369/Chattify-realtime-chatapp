import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// vite.config.js - UPDATE PORT
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      "/api": {
        target: "http://localhost:5000", // Should be 5001
        changeOrigin: true,
        secure: false,
      }
    }
  }
})
