import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import fs from 'fs';
import { defineConfig } from 'vite';

export default defineConfig(() => {
  const serverPath = path.resolve(__dirname, 'server/app.js');
  const hasLocalServer = fs.existsSync(serverPath);

  return {
    plugins: [
      react(), 
      tailwindcss(),
      ...(hasLocalServer
        ? [
            {
              name: 'express-server',
              configureServer(server: any) {
                server.middlewares.use(async (req: any, res: any, next: any) => {
                  try {
                    const serverModule = await import('./server/app.js');
                    const app = serverModule.default;
                    app(req, res, next);
                  } catch (err) {
                    next(err);
                  }
                });
              }
            }
          ]
        : [])
    ],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    server: {
      proxy: !hasLocalServer ? {
        '/api': {
          target: process.env.VITE_API_URL || 'http://localhost:5000',
          changeOrigin: true,
          secure: false,
        }
      } : undefined,
      hmr: process.env.DISABLE_HMR !== 'true',
      watch: process.env.DISABLE_HMR === 'true' ? null : {},
    },
  };
});