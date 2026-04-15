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
      manifest: {
        name: 'Gestión y Remates PWA',
        short_name: 'Remates',
        description: 'Gestión e inteligencia de inversiones en remates judiciales',
        theme_color: '#000000',
        background_color: '#000000',
        display: 'standalone',
      }
    })
  ],
})
