// vite.config.ts
import { defineConfig } from "file:///D:/code-adny/unplugin-imagemin/node_modules/.pnpm/vite@3.2.4_less@4.1.3+sass@1.56.1/node_modules/vite/dist/node/index.js";
import vue from "file:///D:/code-adny/unplugin-imagemin/node_modules/.pnpm/@vitejs+plugin-vue@3.2.0_vite@3.2.4+vue@3.2.45/node_modules/@vitejs/plugin-vue/dist/index.mjs";
import imagemin from "file:///D:/code-adny/unplugin-imagemin/dist/vite.mjs";
import path from "path";
var __vite_injected_original_dirname = "D:\\code-adny\\unplugin-imagemin\\playground";
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
      beforeBundle: false,
      mode: "sharp",
      compress: {
        jpeg: {
          quality: 25
        },
        png: {
          quality: 25
        },
        webp: {
          quality: 25
        }
      },
      conversion: [
        { from: "png", to: "jpg" },
        { from: "jpeg", to: "png" }
      ]
    })
  ]
});
export {
  vite_config_default as default
};
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsidml0ZS5jb25maWcudHMiXSwKICAic291cmNlc0NvbnRlbnQiOiBbImNvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9kaXJuYW1lID0gXCJEOlxcXFxjb2RlLWFkbnlcXFxcdW5wbHVnaW4taW1hZ2VtaW5cXFxccGxheWdyb3VuZFwiO2NvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9maWxlbmFtZSA9IFwiRDpcXFxcY29kZS1hZG55XFxcXHVucGx1Z2luLWltYWdlbWluXFxcXHBsYXlncm91bmRcXFxcdml0ZS5jb25maWcudHNcIjtjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfaW1wb3J0X21ldGFfdXJsID0gXCJmaWxlOi8vL0Q6L2NvZGUtYWRueS91bnBsdWdpbi1pbWFnZW1pbi9wbGF5Z3JvdW5kL3ZpdGUuY29uZmlnLnRzXCI7aW1wb3J0IHsgZGVmaW5lQ29uZmlnIH0gZnJvbSAndml0ZSc7XG5pbXBvcnQgdnVlIGZyb20gJ0B2aXRlanMvcGx1Z2luLXZ1ZSc7XG5pbXBvcnQgaW1hZ2VtaW4gZnJvbSAndW5wbHVnaW4taW1hZ2VtaW4vdml0ZSc7XG5pbXBvcnQgcGF0aCBmcm9tICdwYXRoJztcbi8vIGh0dHBzOi8vdml0ZWpzLmRldi9jb25maWcvXG5leHBvcnQgZGVmYXVsdCBkZWZpbmVDb25maWcoe1xuICByZXNvbHZlOiB7XG4gICAgYWxpYXM6IHtcbiAgICAgICd+Lyc6IGAke3BhdGgucmVzb2x2ZShfX2Rpcm5hbWUsICdzcmMnKX0vYCxcbiAgICAgICdALyc6IGAke3BhdGgucmVzb2x2ZShfX2Rpcm5hbWUsICdzcmMnKX0vYCxcbiAgICB9LFxuICB9LFxuICBwbHVnaW5zOiBbXG4gICAgdnVlKCksXG4gICAgaW1hZ2VtaW4oe1xuICAgICAgLy8gXHU2MzQ2XHU3RUQxXHU1MjREXHU2Nzg0XHU1RUZBIFx1NjIxNlx1ODAwNSBcdTYzNDZcdTdFRDFcdTU0MEVcdTY3ODRcdTVFRkFcbiAgICAgIC8vIGJlZm9yZUJ1bmRsZTogdHJ1ZSxcbiAgICAgIGJlZm9yZUJ1bmRsZTogZmFsc2UsXG4gICAgICBtb2RlOiAnc2hhcnAnLFxuICAgICAgLy8gbW9kZTogJ3NxdW9vc2gnLFxuICAgICAgY29tcHJlc3M6IHtcbiAgICAgICAganBlZzoge1xuICAgICAgICAgIHF1YWxpdHk6IDI1LFxuICAgICAgICB9LFxuICAgICAgICBwbmc6IHtcbiAgICAgICAgICBxdWFsaXR5OiAyNSxcbiAgICAgICAgfSxcbiAgICAgICAgd2VicDoge1xuICAgICAgICAgIHF1YWxpdHk6IDI1LFxuICAgICAgICB9LFxuICAgICAgfSxcbiAgICAgIGNvbnZlcnNpb246IFtcbiAgICAgICAgeyBmcm9tOiAncG5nJywgdG86ICdqcGcnIH0sXG4gICAgICAgIHsgZnJvbTogJ2pwZWcnLCB0bzogJ3BuZycgfSxcbiAgICAgIF0sXG4gICAgICAvLyBjYWNoZTogZmFsc2UsXG4gICAgfSksXG4gIF0sXG59KTtcbiJdLAogICJtYXBwaW5ncyI6ICI7QUFBcVQsU0FBUyxvQkFBb0I7QUFDbFYsT0FBTyxTQUFTO0FBQ2hCLE9BQU8sY0FBYztBQUNyQixPQUFPLFVBQVU7QUFIakIsSUFBTSxtQ0FBbUM7QUFLekMsSUFBTyxzQkFBUSxhQUFhO0FBQUEsRUFDMUIsU0FBUztBQUFBLElBQ1AsT0FBTztBQUFBLE1BQ0wsTUFBTSxHQUFHLEtBQUssUUFBUSxrQ0FBVyxLQUFLO0FBQUEsTUFDdEMsTUFBTSxHQUFHLEtBQUssUUFBUSxrQ0FBVyxLQUFLO0FBQUEsSUFDeEM7QUFBQSxFQUNGO0FBQUEsRUFDQSxTQUFTO0FBQUEsSUFDUCxJQUFJO0FBQUEsSUFDSixTQUFTO0FBQUEsTUFHUCxjQUFjO0FBQUEsTUFDZCxNQUFNO0FBQUEsTUFFTixVQUFVO0FBQUEsUUFDUixNQUFNO0FBQUEsVUFDSixTQUFTO0FBQUEsUUFDWDtBQUFBLFFBQ0EsS0FBSztBQUFBLFVBQ0gsU0FBUztBQUFBLFFBQ1g7QUFBQSxRQUNBLE1BQU07QUFBQSxVQUNKLFNBQVM7QUFBQSxRQUNYO0FBQUEsTUFDRjtBQUFBLE1BQ0EsWUFBWTtBQUFBLFFBQ1YsRUFBRSxNQUFNLE9BQU8sSUFBSSxNQUFNO0FBQUEsUUFDekIsRUFBRSxNQUFNLFFBQVEsSUFBSSxNQUFNO0FBQUEsTUFDNUI7QUFBQSxJQUVGLENBQUM7QUFBQSxFQUNIO0FBQ0YsQ0FBQzsiLAogICJuYW1lcyI6IFtdCn0K
