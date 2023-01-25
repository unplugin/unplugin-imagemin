// vite.config.ts
import { defineConfig } from "file:///D:/2023/github/unplugin-imagemin/node_modules/.pnpm/vite@4.0.3_less@4.1.3+sass@1.57.1/node_modules/vite/dist/node/index.js";
import vue from "file:///D:/2023/github/unplugin-imagemin/node_modules/.pnpm/@vitejs+plugin-vue@3.2.0_vite@4.0.3+vue@3.2.45/node_modules/@vitejs/plugin-vue/dist/index.mjs";
import imagemin from "file:///D:/2023/github/unplugin-imagemin/dist/vite.mjs";
import path from "path";
var __vite_injected_original_dirname = "D:\\2023\\github\\unplugin-imagemin\\playground";
var vite_config_default = defineConfig({
  resolve: {
    alias: {
      "~/": `${path.resolve(__vite_injected_original_dirname, "src")}/`,
      "@/": `${path.resolve(__vite_injected_original_dirname, "src")}/`
    }
  },
  plugins: [
    vue(),
    imagemin({
      mode: "sharp",
      beforeBundle: false,
      conversion: [
        { from: "png", to: "webp" },
        { from: "jpg", to: "webp" },
        { from: "jpeg", to: "webp" }
      ]
    })
  ]
});
export {
  vite_config_default as default
};
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsidml0ZS5jb25maWcudHMiXSwKICAic291cmNlc0NvbnRlbnQiOiBbImNvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9kaXJuYW1lID0gXCJEOlxcXFwyMDIzXFxcXGdpdGh1YlxcXFx1bnBsdWdpbi1pbWFnZW1pblxcXFxwbGF5Z3JvdW5kXCI7Y29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2ZpbGVuYW1lID0gXCJEOlxcXFwyMDIzXFxcXGdpdGh1YlxcXFx1bnBsdWdpbi1pbWFnZW1pblxcXFxwbGF5Z3JvdW5kXFxcXHZpdGUuY29uZmlnLnRzXCI7Y29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2ltcG9ydF9tZXRhX3VybCA9IFwiZmlsZTovLy9EOi8yMDIzL2dpdGh1Yi91bnBsdWdpbi1pbWFnZW1pbi9wbGF5Z3JvdW5kL3ZpdGUuY29uZmlnLnRzXCI7aW1wb3J0IHsgZGVmaW5lQ29uZmlnIH0gZnJvbSAndml0ZSc7XG5pbXBvcnQgdnVlIGZyb20gJ0B2aXRlanMvcGx1Z2luLXZ1ZSc7XG5pbXBvcnQgaW1hZ2VtaW4gZnJvbSAndW5wbHVnaW4taW1hZ2VtaW4vdml0ZSc7XG5pbXBvcnQgcGF0aCBmcm9tICdwYXRoJztcbi8vIGh0dHBzOi8vdml0ZWpzLmRldi9jb25maWcvXG5leHBvcnQgZGVmYXVsdCBkZWZpbmVDb25maWcoe1xuICByZXNvbHZlOiB7XG4gICAgYWxpYXM6IHtcbiAgICAgICd+Lyc6IGAke3BhdGgucmVzb2x2ZShfX2Rpcm5hbWUsICdzcmMnKX0vYCxcbiAgICAgICdALyc6IGAke3BhdGgucmVzb2x2ZShfX2Rpcm5hbWUsICdzcmMnKX0vYCxcbiAgICB9LFxuICB9LFxuICBwbHVnaW5zOiBbXG4gICAgdnVlKCksXG4gICAgaW1hZ2VtaW4oe1xuICAgICAgbW9kZTogJ3NoYXJwJyxcbiAgICAgIGJlZm9yZUJ1bmRsZTogZmFsc2UsXG4gICAgICBjb252ZXJzaW9uOiBbXG4gICAgICAgIHsgZnJvbTogJ3BuZycsIHRvOiAnd2VicCcgfSxcbiAgICAgICAgeyBmcm9tOiAnanBnJywgdG86ICd3ZWJwJyB9LFxuICAgICAgICB7IGZyb206ICdqcGVnJywgdG86ICd3ZWJwJyB9LFxuICAgICAgXSxcbiAgICB9KSxcbiAgXSxcbn0pO1xuIl0sCiAgIm1hcHBpbmdzIjogIjtBQUE2VCxTQUFTLG9CQUFvQjtBQUMxVixPQUFPLFNBQVM7QUFDaEIsT0FBTyxjQUFjO0FBQ3JCLE9BQU8sVUFBVTtBQUhqQixJQUFNLG1DQUFtQztBQUt6QyxJQUFPLHNCQUFRLGFBQWE7QUFBQSxFQUMxQixTQUFTO0FBQUEsSUFDUCxPQUFPO0FBQUEsTUFDTCxNQUFNLEdBQUcsS0FBSyxRQUFRLGtDQUFXLEtBQUs7QUFBQSxNQUN0QyxNQUFNLEdBQUcsS0FBSyxRQUFRLGtDQUFXLEtBQUs7QUFBQSxJQUN4QztBQUFBLEVBQ0Y7QUFBQSxFQUNBLFNBQVM7QUFBQSxJQUNQLElBQUk7QUFBQSxJQUNKLFNBQVM7QUFBQSxNQUNQLE1BQU07QUFBQSxNQUNOLGNBQWM7QUFBQSxNQUNkLFlBQVk7QUFBQSxRQUNWLEVBQUUsTUFBTSxPQUFPLElBQUksT0FBTztBQUFBLFFBQzFCLEVBQUUsTUFBTSxPQUFPLElBQUksT0FBTztBQUFBLFFBQzFCLEVBQUUsTUFBTSxRQUFRLElBQUksT0FBTztBQUFBLE1BQzdCO0FBQUEsSUFDRixDQUFDO0FBQUEsRUFDSDtBQUNGLENBQUM7IiwKICAibmFtZXMiOiBbXQp9Cg==
