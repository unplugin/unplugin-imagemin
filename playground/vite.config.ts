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
  plugins: [
    vue(),
    // imagemin({
    //   // default true
    //   cache: false,
    //   // Default configuration options for compressing different pictures
    //   compress: {
    //     jpg: {
    //       quality: 10,
    //     },
    //     jpeg: {
    //       quality: 10,
    //     },
    //     png: {
    //       quality: 10,
    //     },
    //     webp: {
    //       quality: 10,
    //     },
    //   },
    //   conversion: [
    //     { from: 'jpeg', to: 'webp' },
    //     { from: 'png', to: 'webp' },
    //     { from: 'JPG', to: 'jpeg' },
    //   ],
    // }),
    imagemin({
      conversion: [
        { from: 'jpeg', to: 'webp' },
        { from: 'png', to: 'webp' },
        { from: 'JPG', to: 'jpeg' },
      ],
    }),
  ],
});
