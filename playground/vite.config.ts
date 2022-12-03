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
      // 捆绑前构建 或者 捆绑后构建
      // beforeBundle: true,
      beforeBundle: false,
      // mode: 'sharp',
      mode: 'squoosh',
      compress: {
        jpeg: {
          quality: 25,
        },
        png: {
          quality: 25,
        },
        webp: {
          quality: 25,
        },
      },
      conversion: [
        { from: 'png', to: 'jpg' },
        { from: 'jpeg', to: 'webp' },
      ],
      // cache: false,
    }),
  ],
});
