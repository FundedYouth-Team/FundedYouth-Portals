/// <reference types="vitest" />
import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react-swc'
import tsconfigPaths from 'vite-tsconfig-paths'

// https://vitejs.dev/config https://vitest.dev/config
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");

  return {
    plugins: [react(), tsconfigPaths()],
    server: {
      proxy: {
        "/api/blog": {
          target: "https://fundedyouth.org",
          changeOrigin: true,
          rewrite: (path) => path.replace(/^\/api\/blog/, "/blog"),
        },
        "/api/eventbrite": {
          target: "https://www.eventbriteapi.com",
          changeOrigin: true,
          rewrite: (path) => path.replace(/^\/api\/eventbrite/, ""),
          configure: (proxy) => {
            proxy.on("proxyReq", (proxyReq) => {
              proxyReq.setHeader(
                "Authorization",
                `Bearer ${env.EVENTBRITE_PRIVATE_TOKEN}`
              );
            });
          },
        },
      },
    },
    test: {
      globals: true,
      environment: 'happy-dom',
      setupFiles: '.vitest/setup',
      include: ['**/test.{ts,tsx}']
    }
  };
})
