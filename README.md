# 📦📦 unplugin Imagemin Picture compression

[![NPM version](https://img.shields.io/npm/v/unplugin-imagemin?color=a1b858&label=)](https://www.npmjs.com/package/unplugin-imagemin)

### ✨✨ Continuous iterative development in testing

###### Features

- 🦾 High Performance based on squoosh and rust / wasm
- ✨ Multiple picture formats can be configured
- 🪐 Compress the code at build time
- 🌈 You can convert different picture types at build time
- 😃 Caching mechanism

## TODO

- transform with unplugin context
- use cache in node_modules
- refactor user options
- Various types of pictures （Svg is not supported）
- pref If there is this type or picture, then continue to go down.
- transform get global ctx || context
- resolve generateBundle callback replace code
- Attribute compress test error
- Css module conversion
## Installation

```bash
npm i unplugin-imagemin -D
```

<details>
<summary>Vite</summary><br>

```ts
import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import imagemin from 'unplugin-imagemin/vite';
import path from 'path';
// https://vitejs.dev/config/
export default defineConfig({
  resolve: {
    alias: {
      '~/': `${path.resolve(__dirname, 'src')}/`,
      '@/': `${path.resolve(__dirname, 'src')}/`,
    },
  },
  plugins: [
    vue(),
    imagemin({
      compress: {
        jpg: {
          quality: 0,
        },
        jpeg: {
          quality: 0,
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
        { from: 'jpeg', to: 'webp' },
      ],
      // cache: false,
    }),
  ],
});

```

<br></details>

<details>
<summary>Webpack</summary><br>

```ts
// webpack.config.js
```

<br></details>

## Configuration

```ts
    imagemin({
      // Default configuration options for compressing different pictures
      compress: {
        jpg: {
          quality: 0,
        },
        jpeg: {
          quality: 0,
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
        { from: 'jpeg', to: 'webp' },
      ],
      cache: false,
    }),
```

#  Squoosh

Introduction Squoosh

