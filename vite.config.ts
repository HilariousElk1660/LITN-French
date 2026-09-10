// @lovable.dev/vite-tanstack-config already includes the following — do NOT add them manually
// or the app will break with duplicate plugins:
//   - tanstackStart, viteReact, tailwindcss, tsConfigPaths, nitro (build-only using cloudflare as a default target),
//     componentTagger (dev-only), VITE_* env injection, @ path alias, React/TanStack dedupe,
//     error logger plugins, and sandbox detection (port/host/strictPort).
// You can pass additional config via defineConfig({ vite: { ... }, etc... }) if needed.
import { defineConfig } from "@lovable.dev/vite-tanstack-config";
import {VitePWA} from 'vite-plugin-pwa'

export default defineConfig({
plugins: [
    // ...other plugins
    VitePWA({
      registerType: 'autoUpdate',
      injectRegister: 'auto',
      outDir: '.output/public',
      filename: 'sw.js',
      devOptions: {
        enabled: true,
        type: 'module',
      },
      strategies: 'generateSW',
      includeAssets: ['favicon.ico', 'apple-touch-icon.png', 'pwa-192.png', 'pwa-512.png', 'maskable-icon-512.png', 'offline.html'],
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
      workbox: {
        globDirectory: '.output/public',
        globPatterns: ['**/*.{js,css,html,ico,png,svg}'],
        navigateFallback: '/offline.html',
        navigateFallbackAllowlist: [/^\//],
        navigateFallbackDenylist: [/^\/favicon\.ico$/, /^\/api\//],
        dontCacheBustURLsMatching: /\.[a-f0-9]{8}\./,
        runtimeCaching: [
          {
            urlPattern: ({ request }) => request.destination === 'document',
            handler: 'NetworkFirst',
            options: {
              cacheName: 'pages-cache',
              networkTimeoutSeconds: 3,
              expiration: {
                maxEntries: 50,
                maxAgeSeconds: 60 * 60 * 24 * 7, // 7 days
              },
            },
          },
          {
            urlPattern: ({ request }) => request.destination === 'script' || request.destination === 'style' || request.destination === 'worker',
            handler: 'StaleWhileRevalidate',
            options: {
              cacheName: 'static-resources',
            },
          },
          {
            urlPattern: ({ request }) => request.destination === 'image' || request.destination === 'font',
            handler: 'CacheFirst',
            options: {
              cacheName: 'assets-cache',
              expiration: {
                maxEntries: 200,
                maxAgeSeconds: 60 * 60 * 24 * 30, // 30 days
              },
            },
          },
          {
            urlPattern: ({ url }) =>
              url.pathname.includes('/all_books') ||
              url.pathname.includes('/library') ||
              url.pathname.includes('/readers_requests') ||
              url.pathname.includes('/admin_books'),
            handler: 'NetworkFirst',
            options: {
              cacheName: 'api-data-cache',
              networkTimeoutSeconds: 3,
              expiration: {
                maxEntries: 100,
                maxAgeSeconds: 60 * 60 * 24 * 7, // 7 days
              },
            },
          },
        ],
      },
    }),
  ],

  tanstackStart: {
    // Redirect TanStack Start's bundled server entry to src/server.ts (our SSR error wrapper).
    // nitro/vite builds from this
    server: { entry: "server" },
  },
  vite: {
    server: {
      proxy: {
        "/auth": {
          target: "http://localhost:8000",
          changeOrigin: true,
          secure: false,
        },
        "/admin_books": {
          target: "http://localhost:8000",
          changeOrigin: true,
          secure: false,
        },
        "/book_requests": {
          target: "http://localhost:8000",
          changeOrigin: true,
          secure: false,
        },
        "/update_book_request": {
          target: "http://localhost:8000",
          changeOrigin: true,
          secure: false,
        },
        "/delete_book": {
          target: "http://localhost:8000",
          changeOrigin: true,
          secure: false,
        },
        "/create_book": {
          target: "http://localhost:8000",
          changeOrigin: true,
          secure: false,
        },
        "/all_books": {
          target: "http://localhost:8000",
          changeOrigin: true,
          secure: false,
        },
      },
    },
  },
});
