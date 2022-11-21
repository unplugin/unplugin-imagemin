import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import imagemin from 'unplugin-imagemin/vite';
import wasm from 'vite-plugin-wasm'
import toplevel from 'vite-plugin-top-level-await'
// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    vue(),
    toplevel({
      promiseExportName: '__tla',
      promiseImportName: i => `__tla.${i}`
    }),
    wasm(),
    imagemin(),
  ],
});
