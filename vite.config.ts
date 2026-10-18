import 'dotenv/config';
import angular from '@analogjs/vite-plugin-angular';
import tailwindcss from '@tailwindcss/vite';
import path from 'path';
import {defineConfig, type Plugin} from 'vite';
import { handleApiRequest } from './src/server/api.middleware.ts';

function apiPlugin(): Plugin {
  return {
    name: 'api-gateway-middleware',
    configureServer(server) {
      server.middlewares.use((req, res, next) => {
        if (handleApiRequest(req, res)) {
          return;
        }
        next();
      });
    },
    configurePreviewServer(server) {
      server.middlewares.use((req, res, next) => {
        if (handleApiRequest(req, res)) {
          return;
        }
        next();
      });
    }
  };
}

export default defineConfig(() => {
  return {
    plugins: [
      apiPlugin(),
      angular({
        tsconfig: 'tsconfig.app.json'
      }),
      tailwindcss()
    ],
    resolve: {
      alias: {
        '@': path.resolve(import.meta.dirname, 'src'),
      },
    },
    server: {
      // HMR is disabled in AI Studio via DISABLE_HMR env var.
      // Do not modifyâfile watching is disabled to prevent flickering during agent edits.
      hmr: process.env.DISABLE_HMR !== 'true',
      // Disable file watching when DISABLE_HMR is true to save CPU during agent edits.
      watch: process.env.DISABLE_HMR === 'true' ? null : {},
    },
  };
});
