# 📦📦 unplugin Picture compression

[![NPM version](https://img.shields.io/npm/v/unplugin-imagemin?color=a1b858&label=)](https://www.npmjs.com/package/unplugin-imagemin)

### ✨✨ Continuous iterative development in testing

###### Features

- 🪐 Folder names as namespaces.
- 🦾 Full TypeScript support.
- 🌈 [Built-in resolvers](#importing-from-ui-libraries) for popular UI libraries.
- 😃 Works perfectly with [unplugin-icons](https://github.com/antfu/unplugin-icons).

## TODO 
- transform with unplugin context
- use cache in node_modules
- refactor user options 
- Various types of pictures （Svg is not supported）
- pref If there is this type or picture, then continue to go down.
- transform get global ctx || context
- resolve generateBundle callback replace code

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
export default defineConfig({
  plugins: [
    vue(),
    imagemin({
      conversion: [{ from: /(png)/g, to: 'mozjpeg' }, { from: /(jpg|jpeg)/g, to: 'webp' }]
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


## Usage




