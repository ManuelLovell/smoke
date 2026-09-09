import { defineConfig } from 'vite'
import path from 'path'
import react from '@vitejs/plugin-react'
import fs from 'fs'

const packageJson = JSON.parse(fs.readFileSync(path.resolve(__dirname, 'package.json'), 'utf-8'));
let appVersion = packageJson.version;

try {
  const manifestJson = JSON.parse(fs.readFileSync(path.resolve(__dirname, 'public/manifest.json'), 'utf-8'));
  if (manifestJson.version) {
    appVersion = String(manifestJson.version);
  }
} catch {
  // Keep package.json version fallback when manifest is unavailable.
}

// https://vite.dev/config/
export default defineConfig({
  define: {
    __APP_VERSION__: JSON.stringify(appVersion),
  },
  plugins: [
    react({
      babel: {
        plugins: [
          'babel-plugin-macros',
        ],
      },
    }),
  ],
  server: { cors: true },
  build: {
    target: 'esnext',
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (!id.includes('node_modules')) {
            return;
          }

          if (id.includes('react-dom') || id.includes('react/cjs') || id.includes('/react/')) {
            return 'react-vendor';
          }

          if (id.includes('framer-motion')) {
            return 'motion-vendor';
          }

          if (id.includes('styled-components') || id.includes('twin.macro')) {
            return 'style-vendor';
          }

          if (id.includes('lucide-react')) {
            return 'icons-vendor';
          }

          if (id.includes('@owlbear-rodeo/sdk')) {
            return 'obr-vendor';
          }

          if (id.includes('@supabase/supabase-js')) {
            return 'supabase-vendor';
          }

          if (id.includes('zustand')) {
            return 'state-vendor';
          }

          return 'vendor';
        },
      },
      input: {
        main: path.resolve(__dirname, "pages/index.html"),
        linetool: path.resolve(__dirname, 'pages/line.html'),
        brushtool: path.resolve(__dirname, 'pages/brush.html'),
        elevationtool: path.resolve(__dirname, 'pages/elevation.html'),
        elevationwarning: path.resolve(__dirname, 'pages/ewarning.html'),
        polygontool: path.resolve(__dirname, 'pages/polygon.html'),
        unitcontextembed: path.resolve(__dirname, 'pages/unitcontextembed.html'),
        wallcontextembed: path.resolve(__dirname, 'pages/wallcontextembed.html'),
        mapcontextembed: path.resolve(__dirname, 'pages/mapcontextembed.html'),
        converting: path.resolve(__dirname, "pages/converting.html"),
        notice: path.resolve(__dirname, "pages/notice.html"),
        progressbar: path.resolve(__dirname, "pages/progressbar.html")
      }
    }
  }
})
