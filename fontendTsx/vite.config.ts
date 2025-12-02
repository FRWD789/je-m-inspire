import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import svgr from "vite-plugin-svgr"
import path from "path"

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(),
    tailwindcss(),
    svgr()
  ],
   resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  server: {
    host: true, // permet d'accéder depuis d'autres IP
    port: 5173,
    hmr: {
      protocol: 'ws',
      host: 'localhost',
      port: 5173,
    },
  },

  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          // Séparer les vendors pour meilleur caching
          'react-vendor': ['react', 'react-dom', 'react-router-dom'],
          'ui-vendor': ['lucide-react'],
        },
      },
    },
    chunkSizeWarningLimit: 600,
    // Optimisation des images statiques
    assetsInlineLimit: 0, // Ne pas inline les images en base64
  },
});
