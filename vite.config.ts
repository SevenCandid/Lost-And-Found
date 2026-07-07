import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    VitePWA({
      registerType: 'autoUpdate',
      strategies: 'injectManifest',
      srcDir: 'src',
      filename: 'sw.ts',
      manifest: {
        name: 'Lost & Found Network UENR',
        short_name: 'Lost & Found',
        description: 'Recover lost belongings quickly and securely at UENR',
        theme_color: '#3b82f6',
        background_color: '#ffffff',
        display: 'standalone',
        start_url: '/',
        icons: [
          {
            src: '/icon-192x192.png',
            sizes: '192x192',
            type: 'image/png'
          },
          {
            src: '/icon-512x512.png',
            sizes: '512x512',
            type: 'image/png'
          }
        ],
        shortcuts: [
          {
            name: 'Report Lost Item',
            short_name: 'Lost',
            description: 'Report an item you lost',
            url: '/report?type=lost',
            icons: [{ src: '/icon-192x192.png', sizes: '192x192' }]
          },
          {
            name: 'Report Found Item',
            short_name: 'Found',
            description: 'Report an item you found',
            url: '/report?type=found',
            icons: [{ src: '/icon-192x192.png', sizes: '192x192' }]
          },
          {
            name: 'Messages',
            short_name: 'Messages',
            description: 'View your conversations',
            url: '/messages',
            icons: [{ src: '/icon-192x192.png', sizes: '192x192' }]
          }
        ]
      },
      injectManifest: {
        swSrc: 'src/sw.ts',
        swDest: 'dist/sw.js',
        globPatterns: ['**/*.{js,css,html,ico,png,svg,webp}']
      },
      devOptions: {
        enabled: true,
        type: 'module'
      }
    })
  ],
})
