# 📦📦 unplugin Picture compression

[![NPM version](https://img.shields.io/npm/v/unplugin-imagemin?color=a1b858&label=)](https://www.npmjs.com/package/unplugin-imagemin)

### ✨✨ Continuous iterative development in testing

## TODO 
- transform with unplugin context
- use cache in node_modules
- refactor user options 
- Various types of pictures （Svg is not supported）
- pref If there is this type or picture, then continue to go down.
- transform get global ctx || context
- resolve generateBundle callback replace code

## Install

```ts
pnpm install unplugin-imagemin -D
```


## Useage

```ts
import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import imagemin from 'unplugin-imagemin/vite';
export default defineConfig({
  plugins: [
    vue(),
    imagemin({
      conversion: [{ from: /(png)/g, to: 'mozjpeg' }, { from: /(jpg|jpeg)/g, to: 'webp' }]
    }),
  ],
});


```


