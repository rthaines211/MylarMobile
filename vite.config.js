import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['icons/*.png'],
      manifest: {
        name: 'Mylar Mobile',
        short_name: 'Mylar',
        description: 'Mobile interface for Mylar3 comic book manager',
        theme_color: '#0f0f0f',
        background_color: '#0f0f0f',
        display: 'standalone',
        icons: [
          {
            src: 'icons/icon-192.png',
            sizes: '192x192',
            type: 'image/png'
          },
          {
            src: 'icons/icon-512.png',
            sizes: '512x512',
            type: 'image/png'
          },
          {
            src: 'icons/icon-512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'maskable'
          }
        ]
      },
      workbox: {
        // Cache API responses with stale-while-revalidate strategy
        runtimeCaching: [
          {
            // Cache comic cover images
            urlPattern: /\/api\?cmd=getArt/,
            handler: 'CacheFirst',
            options: {
              cacheName: 'comic-covers',
              expiration: {
                maxEntries: 500,
                maxAgeSeconds: 60 * 60 * 24 * 30 // 30 days
              },
              cacheableResponse: {
                statuses: [0, 200]
              }
            }
          },
          {
            // Cache comic data API calls with stale-while-revalidate
            urlPattern: /\/api\?cmd=(getIndex|getComic|getComicInfo)/,
            handler: 'StaleWhileRevalidate',
            options: {
              cacheName: 'comic-data',
              expiration: {
                maxEntries: 100,
                maxAgeSeconds: 60 * 60 * 24 // 1 day
              },
              cacheableResponse: {
                statuses: [0, 200]
              }
            }
          },
          {
            // Cache list API calls (upcoming, wanted, history) - shorter cache
            urlPattern: /\/api\?cmd=(getUpcoming|getWanted|getHistory)/,
            handler: 'NetworkFirst',
            options: {
              cacheName: 'comic-lists',
              expiration: {
                maxEntries: 50,
                maxAgeSeconds: 60 * 60 // 1 hour
              },
              cacheableResponse: {
                statuses: [0, 200]
              },
              networkTimeoutSeconds: 5
            }
          },
          {
            // Cache backend API calls (weekly pull list)
            urlPattern: /\/backend\//,
            handler: 'NetworkFirst',
            options: {
              cacheName: 'backend-data',
              expiration: {
                maxEntries: 50,
                maxAgeSeconds: 60 * 60 // 1 hour
              },
              cacheableResponse: {
                statuses: [0, 200]
              },
              networkTimeoutSeconds: 5
            }
          }
        ],
        // Pre-cache essential assets
        globPatterns: ['**/*.{js,css,html,ico,png,svg,woff2}']
      }
    })
  ],
  server: {
    proxy: {
      '/api': {
        target: 'http://100.81.70.9:8090',
        changeOrigin: true,
      },
      '/searchit': {
        target: 'http://100.81.70.9:8090',
        changeOrigin: true,
      },
      '/backend': {
        target: 'http://localhost:3001',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/backend/, '/api'),
      }
    }
  }
})
