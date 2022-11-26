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
  plugins: [
    vue(),
    imagemin({
      compress: {
        jpg: {
          quality: 0,
        },
        jpeg: {
          quality: 0,
        },
        png: {
          quality: 100,
        },
        webp: {
          quality: 100,
        },
      },
      conversion: [
        { from: 'png', to: 'mozjpeg' },
        { from: 'jpeg', to: 'webp' },
      ],
      cache: true,
    }),
  ],
});
