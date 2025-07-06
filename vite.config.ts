import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { resolve } from 'path'
import type { UserConfig } from 'vite'

export default defineConfig({
  plugins: [react()],
  build: {
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'src/index.html'), // Main app from src
        frame: resolve(__dirname, 'public/frame.html') // Frame from public
      },
      output: {
        entryFileNames: 'assets/[name].[hash].js',
        chunkFileNames: 'assets/[name].[hash].js',
        assetFileNames: 'assets/[name].[hash].[ext]'
      }
    }
  },
  server: {
    port: 5173,
    open: '/frame.html' // Auto-open frame in dev mode
  },
  publicDir: 'public',
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src') // Optional but recommended
    }
  }
}) satisfies UserConfig

// import { defineConfig } from 'vite'
// import react from '@vitejs/plugin-react'

// // https://vite.dev/config/
// export default defineConfig({
//   plugins: [react()],
// })
