import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/jira-proxy': {
        target: 'https://implyteam.atlassian.net', // Default fallback
        changeOrigin: true,
        secure: false,
        router: (req) => {
          // Extract the target domain dynamically
          const match = req.url?.match(/^\/jira-proxy\/(https:\/\/[^\/]+)/);
          if (match) {
            return match[1];
          }
          return 'https://implyteam.atlassian.net';
        },
        rewrite: (path) => {
          // Remove the /jira-proxy/https://domain.com part, keeping only the path
          const match = path.match(/^\/jira-proxy\/https:\/\/[^\/]+(.*)/);
          if (match) {
            return match[1];
          }
          return path.replace(/^\/jira-proxy/, '');
        },
        configure: (proxy, _options) => {
          proxy.on('proxyReq', (proxyReq, req, _res) => {
            // Jira blocks POST requests if Origin or Referer is localhost due to CSRF protection.
            // We strip or rewrite them so it looks like a server-to-server request.
            proxyReq.setHeader('Origin', `https://${proxyReq.host}`);
            proxyReq.setHeader('Referer', `https://${proxyReq.host}`);
            proxyReq.setHeader('X-Atlassian-Token', 'no-check');
            proxyReq.setHeader('User-Agent', 'curl/7.68.0'); // Pretend to be curl to bypass browser checks
          });
        }
      }
    }
  }
})
