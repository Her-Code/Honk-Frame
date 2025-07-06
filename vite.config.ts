import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src')
    }
  },
  build: {
    outDir: 'dist',
    rollupOptions: {
      input: {
        main: path.resolve(__dirname, 'index.html'),
        frame: path.resolve(__dirname, 'public/frame.html') // only if needed
      }
    }
  },
  server: {
    open: '/index.html'
  }
});


// import { defineConfig } from 'vite'
// import react from '@vitejs/plugin-react'
// import { resolve } from 'path'

// export default defineConfig({
//   plugins: [react()],
//   root: './public', // Key change - points to public folder
//   build: {
//     outDir: '../dist', // Output will go to project root/dist
//     emptyOutDir: true,
//     rollupOptions: {
//       input: {
//         main: resolve(__dirname, 'public/index.html'),
//         frame: resolve(__dirname, 'public/frame.html')
//       }
//     }
//   },
//   server: {
//     open: '/index.html' // Ensures correct file opens on dev server start
//   }
// })

// import { defineConfig } from 'vite'
// import react from '@vitejs/plugin-react'
// import { resolve } from 'path'
// import type { UserConfig } from 'vite'

// export default defineConfig({
//   plugins: [react()],
//   build: {
//     rollupOptions: {
//       input: {
//         main: resolve(__dirname, 'public/index.html'), // Main app from src
//         frame: resolve(__dirname, 'public/frame.html') // Frame from public
//       },
//       output: {
//         entryFileNames: 'assets/[name].[hash].js',
//         chunkFileNames: 'assets/[name].[hash].js',
//         assetFileNames: 'assets/[name].[hash].[ext]'
//       }
//     }
//   },
//   server: {
//     port: 5173,
//     open: '/frame.html' // Auto-open frame in dev mode
//   },
//   publicDir: 'public',
//   resolve: {
//     alias: {
//       '@': resolve(__dirname, 'src') // Optional but recommended
//     }
//   }
// }) satisfies UserConfig

// import { defineConfig } from 'vite'
// import react from '@vitejs/plugin-react'

// // https://vite.dev/config/
// export default defineConfig({
//   plugins: [react()],
// })
