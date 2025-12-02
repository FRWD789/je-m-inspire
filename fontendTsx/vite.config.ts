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
          // =========================================
          // ✅ OPTIMISATION DES CHUNKS
          // =========================================
          // Vendors de base (React, Router)
          'react-vendor': ['react', 'react-dom', 'react-router-dom'],
          
          // UI Libraries
          'ui-vendor': ['lucide-react'],
          
          // Maps (Google Maps est lourd)
          'maps-vendor': ['@react-google-maps/api', '@vis.gl/react-google-maps', '@googlemaps/markerclusterer'],
          
          // Forms & Validation
          'forms-vendor': ['react-hook-form', '@hookform/resolvers', 'zod'],
          
          // Utilitaires
          'utils-vendor': ['axios', 'date-fns', 'clsx', 'tailwind-merge'],
          
          // i18n
          'i18n-vendor': ['i18next', 'react-i18next'],
          
          // Carousel
          'carousel-vendor': ['embla-carousel-react'],
        },
      },
    },
    
    // =========================================
    // ✅ OPTIMISATIONS BUILD
    // =========================================
    chunkSizeWarningLimit: 600,
    assetsInlineLimit: 4096, // Inline assets < 4KB en base64
    
    // Minification
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true, // Supprimer console.log en prod
        drop_debugger: true,
      },
    },
    
    // CSS code splitting
    cssCodeSplit: true,
    
    // Source maps pour debugging (désactiver en prod)
    sourcemap: false,
  },
  
  // =========================================
  // ✅ OPTIMISATIONS DEPS
  // =========================================
  optimizeDeps: {
    include: [
      'react',
      'react-dom',
      'react-router-dom',
      'axios',
    ],
  },
});
