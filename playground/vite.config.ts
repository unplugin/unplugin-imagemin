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
      // // 捆绑前构建 或者 捆绑后构建
      // beforeBundle: true,
      // // beforeBundle: false,
      // mode: 'sharp',
      // mode: 'squoosh',
      // compress: {
      //   // jpeg: {
      //   //   quality: 1,
      //   // },
      //   // jpg: {
      //   //   quality: 1,
      //   // },
      //   // png: {
      //   //   quality: 1,
      //   // },
      //   // webp: {
      //   //   quality: 1,
      //   // },
      // },
      // conversion: [
      //   // { from: 'png', to: 'jpg' },
      //   // { from: 'jpeg', to: 'webp' },
      // ],
      // // cache: false,
    }),
  ],
});
