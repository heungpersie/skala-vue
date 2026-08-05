import { fileURLToPath, URL } from 'node:url'

import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import vueDevTools from 'vite-plugin-vue-devtools'

import { mockApiPlugin } from './mock-api/vitePlugin.js'

// https://vite.dev/config/
export default defineConfig({
  base: '/skala-vue/',
  plugins: [
    vue(),
    vueDevTools(),
    mockApiPlugin(),
  ],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
})
