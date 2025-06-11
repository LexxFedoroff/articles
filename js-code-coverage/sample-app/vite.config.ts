/// <reference types="vitest" />
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import istanbul from 'vite-plugin-istanbul'

export default defineConfig({
  plugins: [
    react(),
    istanbul({
      cypress: true,
      requireEnv: false,
    }),
  ],
  test: {
    environment: 'jsdom',
    coverage: {
      provider: 'istanbul',
      reporter: [['json', { file: 'coverage-final.json' }]],
      reportsDirectory: './.coverage-data/vitest',
      exclude: [
        'node_modules',
        'dist',
        'vite.config.ts',
        'src/main.tsx'
      ],
    },
  },
})