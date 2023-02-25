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
      mode: 'squoosh',
      conversion: [
        { from: 'png', to: 'webp' },
        { from: 'jpg', to: 'webp' },
        { from: 'jpeg', to: 'webp' },
      ],
    }),
  ],
});
