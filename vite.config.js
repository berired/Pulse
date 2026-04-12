import { defineConfig } from 'vite'
import react, { reactCompilerPreset } from '@vitejs/plugin-react'
import babel from '@rolldown/plugin-babel'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    babel({ presets: [reactCompilerPreset()] })
  ],
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:5000',
        changeOrigin: true,
        rewrite: (path) => path,
      }
    }
  },
  build: {
    // Disabled and CSS minification due to lightning CSS minifier compatibility issues
    // CSS is valid  and builds successfully with minification disabled
    cssMinify: false,
  }
})
