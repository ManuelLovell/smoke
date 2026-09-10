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
    {
      name: 'copy-assets-htaccess',
      closeBundle() {
        const source = path.resolve(__dirname, 'public/assets/.htaccess');
        const targetDir = path.resolve(__dirname, 'dist/assets');
        const target = path.resolve(targetDir, '.htaccess');

        if (!fs.existsSync(source)) {
          return;
        }

        fs.mkdirSync(targetDir, { recursive: true });
        fs.copyFileSync(source, target);
      },
    },
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
        index: path.resolve(__dirname, "index.html"),
        'pages/index': path.resolve(__dirname, "pages/index.html"),
        'pages/line': path.resolve(__dirname, 'pages/line.html'),
        'pages/elevation': path.resolve(__dirname, 'pages/elevation.html'),
        'pages/ewarning': path.resolve(__dirname, 'pages/ewarning.html'),
        'pages/polygon': path.resolve(__dirname, 'pages/polygon.html'),
        'pages/unitcontextembed': path.resolve(__dirname, 'pages/unitcontextembed.html'),
        'pages/wallcontextembed': path.resolve(__dirname, 'pages/wallcontextembed.html'),
        'pages/mapcontextembed': path.resolve(__dirname, 'pages/mapcontextembed.html'),
        'pages/converting': path.resolve(__dirname, "pages/converting.html"),
        'pages/notice': path.resolve(__dirname, "pages/notice.html"),
        'pages/progressbar': path.resolve(__dirname, "pages/progressbar.html")
      }
    }
  }
})
