📦📦          unplugin Picture compression


### ✨✨ Continuous iterative development in testing

## TODO 
- transform with unplugin context
- use cache in node_modules
- refactor user options 
- Various types of pictures （Svg is not supported）
- pref If there is this type or picture, then continue to go down.


## Install

```ts
pnpm install unplugin-imagemin -D
```


## Useage

```ts
import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import imagemin from 'unplugin-imagemin/vite';
// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    vue(),
    imagemin(),
  ],
});

```


