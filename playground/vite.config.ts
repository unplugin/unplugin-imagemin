import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import plugin from 'vite-plugin';
console.log(plugin.default);

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [vue(), plugin.default()],
});
