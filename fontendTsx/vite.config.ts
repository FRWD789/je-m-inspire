import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],

  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },

  // ⚡ OPTIMISATIONS DE PERFORMANCE
  build: {
    // Utiliser terser pour meilleure minification
    minify: 'terser',
    
    terserOptions: {
      compress: {
        // 🗑️ Supprimer console.log en production
        drop_console: true,
        drop_debugger: true,
        pure_funcs: ['console.log', 'console.info', 'console.debug'],
        
        // Optimisations supplémentaires
        passes: 2,
        unsafe_comps: true,
        unsafe_math: true,
      },
      
      mangle: {
        safari10: true,
      },
      
      format: {
        comments: false, // Supprimer commentaires
      },
    },

    // 📦 Configuration Rollup pour code splitting optimal
    rollupOptions: {
      output: {
        // 🔀 Manual chunks pour optimiser le code splitting
        manualChunks: (id) => {
          // React et React-DOM dans un chunk séparé
          if (id.includes('node_modules/react') || 
              id.includes('node_modules/react-dom')) {
            return 'react-vendor';
          }

          // React Router dans son propre chunk
          if (id.includes('node_modules/react-router-dom')) {
            return 'router';
          }

          // UI libraries (lucide-react, embla-carousel)
          if (id.includes('node_modules/lucide-react') ||
              id.includes('node_modules/embla-carousel')) {
            return 'ui-vendor';
          }

          // i18next
          if (id.includes('node_modules/react-i18next') ||
              id.includes('node_modules/i18next')) {
            return 'i18n';
          }

          // Google Maps (si présent)
          if (id.includes('@googlemaps') || 
              id.includes('google-maps')) {
            return 'maps';
          }

          // Autres node_modules dans vendor
          if (id.includes('node_modules')) {
            return 'vendor';
          }
        },

        // 🎯 Noms de fichiers avec hash pour cache busting
        chunkFileNames: 'assets/js/[name]-[hash].js',
        entryFileNames: 'assets/js/[name]-[hash].js',
        assetFileNames: (assetInfo) => {
          // Organiser les assets par type
          const info = assetInfo.name.split('.');
          const ext = info[info.length - 1];
          
          if (/png|jpe?g|svg|gif|tiff|bmp|ico|webp|avif/i.test(ext)) {
            return 'assets/img/[name]-[hash][extname]';
          } else if (/woff|woff2|eot|ttf|otf/i.test(ext)) {
            return 'assets/fonts/[name]-[hash][extname]';
          }
          
          return 'assets/[name]-[hash][extname]';
        },
      },
    },

    // 📏 Augmenter le seuil d'avertissement de taille de chunk
    chunkSizeWarningLimit: 1000,

    // 🎨 CSS Code Splitting
    cssCodeSplit: true,

    // 🗜️ Compression
    reportCompressedSize: true,

    // 🎯 Target moderne browsers (pas de polyfills ES5)
    target: 'es2015',
  },

  // ⚙️ Server config (dev)
  server: {
    port: 5173,
    host: true,
    
    // CORS pour API locale
    proxy: {
      '/api': {
        target: 'http://localhost:8000',
        changeOrigin: true,
      },
    },
  },

  // 🔧 Optimisation des dépendances
  optimizeDeps: {
    include: [
      'react',
      'react-dom',
      'react-router-dom',
      'lucide-react',
    ],
    
    // Exclure les gros packages qui ne doivent pas être pré-bundlés
    exclude: [],
  },

  // 🎨 CSS
  css: {
    devSourcemap: false, // Désactiver sourcemaps CSS en dev pour perf
  },
});