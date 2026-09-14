import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  base: './',
  plugins: [react()],
  server: {
    proxy: {
      '/jira-proxy': {
        target: 'https://implyteam.atlassian.net',
        changeOrigin: true,
        secure: false,
        // @ts-ignore - router is supported by http-proxy but may be missing from Vite's types
        router: (req: any) => {
          const match = req.url?.match(/^\/jira-proxy\/(https?:\/\/[^/]+)/);
          if (match) {
            return match[1];
          }
          const matchNoProto = req.url?.match(/^\/jira-proxy\/([^/]+\.atlassian\.net)/);
          if (matchNoProto) {
            return `https://${matchNoProto[1]}`;
          }
          return 'https://implyteam.atlassian.net';
        },
        rewrite: (path) => {
          // Strips /jira-proxy/https://domain.atlassian.net or /jira-proxy/domain.atlassian.net
          const match = path.match(/^\/jira-proxy\/(?:https?:\/\/)?[^/]+(.*)/);
          if (match) {
            return match[1] || '/';
          }
          return path.replace(/^\/jira-proxy/, '');
        },
        configure: (proxy) => {
          proxy.on('proxyReq', (proxyReq, req) => {
            const match = req.url?.match(/^\/jira-proxy\/(?:https?:\/\/)?([^/]+)/);
            const host = match ? match[1].replace(/^https?:\/\//, '') : 'implyteam.atlassian.net';
            proxyReq.setHeader('Host', host);
            proxyReq.setHeader('Origin', `https://${host}`);
            proxyReq.setHeader('Referer', `https://${host}`);
            proxyReq.setHeader('X-Atlassian-Token', 'no-check');
            proxyReq.setHeader('User-Agent', 'curl/7.68.0');
          });
        },
      },
    },
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks(id: string) {
          if (id.includes('node_modules')) {
            if (id.includes('recharts')) return 'vendor-charts';
            if (id.includes('@forge/bridge')) return 'vendor-forge';
            if (id.includes('react') || id.includes('react-dom') || id.includes('react-router')) {
              return 'vendor-react';
            }
            if (id.includes('lucide-react')) return 'vendor-ui';
          }
        },
      },
    },
    chunkSizeWarningLimit: 1000,
  },
})
