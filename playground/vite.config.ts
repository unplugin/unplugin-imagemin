import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import plugin from 'vite-plugin';
console.log(plugin);

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    vue(),
    plugin({
      name: 'erkelost',
      age: 99999999999999,
    }),
  ],
});
