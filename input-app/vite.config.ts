import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

console.log('[Vite Config] Loading vite.config.ts');

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5174,
    configureServer(server) {
      server.middlewares.unshift((req, res, next) => {
        console.log('[Mock API] Hit: ' + req.url);
        next();
      });
    },
  },
});
