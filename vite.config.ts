import { fileURLToPath } from 'node:url'
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import tsconfigPaths from 'vite-tsconfig-paths'
import {VitePWA} from 'vite-plugin-pwa'

export default defineConfig({
  plugins: [react(), tailwindcss(), tsconfigPaths(),
    VitePWA({
    registerType: 'autoUpdate',
    devOptions: {
      enabled: true
    },
    workbox: {
      globPatterns: ['**/*.{js,mjs,css,html,ico,png,svg,woff2,ttf}'],
    },
    manifest: {
        name: 'LITN — Read Together & Meet Authors',
        short_name: 'LITN',
        description: 'Community-first reading platform with serialised chapters, book rooms, and direct access to authors.',
        start_url: '/',
        scope: '/',
        display: 'standalone',
        orientation: 'any',
        background_color: '#132028',
        theme_color: '#132028',
        categories: ['books', 'reading', 'entertainment', 'social'],
        icons: [
          { src: '/pwa-192.png', sizes: '192x192', type: 'image/png', purpose: 'any' },
          { src: '/pwa-512.png', sizes: '512x512', type: 'image/png', purpose: 'any' },
          { src: '/maskable-icon-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
          { src: '/apple-touch-icon.png', sizes: '180x180', type: 'image/png', purpose: 'any' },
        ],
        shortcuts: [
          {
            name: 'Catalogue',
            short_name: 'Books',
            description: 'Browse all available books',
            url: '/catalogue',
            icons: [{ src: '/pwa-192.png', sizes: '192x192' }],
          },
          {
            name: 'Home',
            short_name: 'Home',
            description: 'LITN home page',
            url: '/',
            icons: [{ src: '/pwa-192.png', sizes: '192x192' }],
          },
        ],
      },
  })
  ],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  server: {
    host: '0.0.0.0',
    port: 5173,
    proxy: {
      '/auth': {
        target: 'http://localhost:8000',
        changeOrigin: true,
        secure: false,
      },
      '/admin_books': {
        target: 'http://localhost:8000',
        changeOrigin: true,
        secure: false,
      },
      '/book_requests': {
        target: 'http://localhost:8000',
        changeOrigin: true,
        secure: false,
      },
      '/update_book_request': {
        target: 'http://localhost:8000',
        changeOrigin: true,
        secure: false,
      },
      '/delete_book': {
        target: 'http://localhost:8000',
        changeOrigin: true,
        secure: false,
      },
      '/create_book': {
        target: 'http://localhost:8000',
        changeOrigin: true,
        secure: false,
      },
      '/all_books': {
        target: 'http://localhost:8000',
        changeOrigin: true,
        secure: false,
      },
    },
  },
})
