import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import {defineConfig} from 'vite';

export default defineConfig(() => {
  return {
    plugins: [react(), tailwindcss()],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    build: {
      chunkSizeWarningLimit: 500,
      rollupOptions: {
        output: {
          manualChunks(id) {
            // Keep the initial route lean. Wallet SDKs are only needed by the
            // authentication modal and checkout, both of which are lazy routes.
            if (id.includes('node_modules/react/') || id.includes('node_modules/react-dom/')) return 'react-vendor';
            if (id.includes('node_modules/react-router')) return 'router-vendor';
            if (id.includes('node_modules/lucide-react')) return 'icons-vendor';
            if (id.includes('@react-oauth') || id.includes('google-auth-library')) return 'google-auth';
            if (id.includes('@stellar/') || id.includes('@creit.tech/stellar-wallets-kit') || id.includes('@lobstrco/')) return 'stellar-wallet';
          }
        }
      }
    },
    server: {
      // HMR is disabled via DISABLE_HMR env var.
      // Do not modify—file watching is disabled to prevent flickering during agent edits.
      hmr: process.env.DISABLE_HMR !== 'true',
      // Disable file watching when DISABLE_HMR is true to save CPU during agent edits.
      watch: process.env.DISABLE_HMR === 'true' ? null : {},
    },
  };
});
