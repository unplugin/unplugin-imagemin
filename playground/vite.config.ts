import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import imagemin from 'unplugin-imagemin/vite';
import path from 'path';
// https://vitejs.dev/config/
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
  plugins: [
    vue(),
    imagemin({
      // Default mode sharp. support squoosh and sharp
      mode: 'squoosh',
      // cache: true,
      beforeBundle: false,
      // Default configuration options for compressing different pictures
      compress: {
        jpg: {
          quality: 10,
        },
        jpeg: {
          quality: 10,
        },
        png: {
          quality: 10,
        },
        webp: {
          quality: 10,
        },
      },
      conversion: [
        { from: 'jpeg', to: 'webp' },
        { from: 'jpg', to: 'webp' },
        { from: 'png', to: 'webp' },
      ],
    }),
  ],
});
