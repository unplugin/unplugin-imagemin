import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import imagemin from 'unplugin-imagemin/vite';
import path from 'path';
// https://vitejs.dev/config/
export default defineConfig({
  resolve: {
    alias: {
      '~/': `${path.resolve(__dirname, 'src')}/`,
      '@/': `${path.resolve(__dirname, 'src')}/`,
    },
  },
  build: {
    assetsInlineLimit: 4096 * 2,
  },
  plugins: [
    vue(),
    imagemin({
      // Default mode squoosh. support squoosh and sharp
      mode: 'sharp',
      beforeBundle: false,
      // Default configuration options for compressing different pictures
      compress: {
        jpg: {
          quality: 50,
        },
        jpeg: {
          quality: 70,
        },
        png: {
          quality: 70,
        },
        webp: {
          quality: 70,
        },
      },
      conversion: [
        { from: 'png', to: 'webp' },
        { from: 'jpeg', to: 'webp' },
      ],
    }),
  ],
});
