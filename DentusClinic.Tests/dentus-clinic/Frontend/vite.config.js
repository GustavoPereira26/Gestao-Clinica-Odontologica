import { defineConfig } from 'vite';
import { loadEnv } from 'vite';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd());

  return {
    server: {
      port: 3000,
      proxy: {
        '/api': {
          target: env.VITE_API_BASE.replace('/api', ''),
          changeOrigin: true,
          secure: false
        }
      }
    }
  };
});
