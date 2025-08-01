import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { VitePWA } from 'vite-plugin-pwa'

// Vite configuration tailored for a Vue 3 progressive web application.  This
// configuration registers the Vue plugin, configures the PWA plugin with
// sensible defaults (automatic updates, offline support and a minimal
// manifest) and exposes an alias for the src directory.  Adding additional
// options here (e.g. proxy rules) can be done as the application grows.
export default defineConfig({
  plugins: [
    vue(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.ico', 'robots.txt', 'apple-touch-icon.png'],
      manifest: {
        name: 'IDC PWA',
        short_name: 'IDCPWA',
        theme_color: '#1976d2',
        background_color: '#ffffff',
        start_url: '/',
        display: 'standalone',
        icons: [
          {
            src: 'icons/icon-192x192.png',
            sizes: '192x192',
            type: 'image/png'
          },
          {
            src: 'icons/icon-512x512.png',
            sizes: '512x512',
            type: 'image/png'
          }
        ]
      }
    })
  ],
  resolve: {
    alias: {
      '@': '/src'
    }
  },
  server: {
    port: 5173
  }
})