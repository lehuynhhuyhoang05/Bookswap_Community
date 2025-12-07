import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react({
      include: ['**/*.jsx', '**/*.js', '**/*.tsx']
    })
  ],
  server: {
    host: true, // Cho phép truy cập từ network (0.0.0.0)
    port: 5173, // Đặt port cố định là 5173
    strictPort: true, // Nếu port bị占用 thì không tự động chuyển port
    open: true // Tự động mở browser
  },
  resolve: {
    extensions: ['.js', '.jsx', '.ts', '.tsx', '.json']
  },
  build: {
    outDir: 'dist',
    sourcemap: true
  }
})