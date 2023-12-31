import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [vue()],
  server: {
    port: 8080
  },
  base: '/api-explorer/',
  build: {
    minify: false,
    commonjsOptions: { include: [] }
  },
  optimizeDeps: {
    disabled: false
  }
})
