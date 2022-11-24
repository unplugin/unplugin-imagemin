import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import imagemin from 'unplugin-imagemin/vite';
// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    vue(),
    imagemin({
      // compress: {
      //   jpg: {
      //     quality: 100,
      //   },
      //   jpeg: {
      //     quality: 100,
      //   },
      //   png: {
      //     quality: 0,
      //   },
      //   webp: {
      //     quality: 0,
      //   },
      // },
      conversion: [
        { from: 'png', to: 'mozjpeg' },
        { from: 'jpeg', to: 'webp' },
      ],
      // cache: false,
    }),
  ],
});
