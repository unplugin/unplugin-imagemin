import { defineConfig } from '@farmfe/core';
import vue from '@vitejs/plugin-vue';
import imagemin from 'unplugin-imagemin/vite';

export default defineConfig({
  vitePlugins: [vue(), imagemin()],
});
