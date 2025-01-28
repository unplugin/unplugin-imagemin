import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import imagemin from 'unplugin-imagemin/vite';
import path from 'node:path';
export default defineConfig({
  // base: '/pathe/',
  resolve: {
    alias: {
      '~/': `${path.resolve(__dirname, 'src')}/`,
      '@/': `${path.resolve(__dirname, 'src')}/`,
    },
  },
  build: {
    // assetsInlineLimit: 4096 * 2,
  },
  server: {
    port: 8451,
  },
  // publicDir: 'base/public',
  plugins: [vue(), imagemin({
    cache: false,
  })],
});
