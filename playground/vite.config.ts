import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import imagemin from 'unplugin-imagemin/vite';
// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    vue(),
    imagemin({
      compress: {
        jpg: {
          quality: 100,
        },
        jpeg: {
          quality: 100,
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
        { from: /(jpg|jpeg)/, to: 'webp' },
      ],
      cache: false,
    }),
  ],
});
