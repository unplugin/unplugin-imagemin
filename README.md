# 📦📦 unplugin Imagemin Picture compression

[![NPM version](https://img.shields.io/npm/v/unplugin-imagemin?color=a1b858&label=)](https://www.npmjs.com/package/unplugin-imagemin)

### ✨✨ Continuous iterative development in testing

```bash
✨ : unplugin-imagemin
✔ : Process start with mode squoosh 
✅ : [test1.png] [12.39 MB] -> [102.54 KB]
✔ : Process start with mode squoosh  
✅ : [test2.png] [16.38 MB] -> [106.79 KB]
```

#### 🌈 Features


- 🍰 Support png jpeg webp avif svg tiff Format
- 🦾 High Performance based on squoosh
- ✨ Multiple picture formats can be configured
- 🪐 Compress the code at build time
- 😃 Caching Mechanism (TODO)
- 🌈 You can convert different picture types at build time


## Squoosh && Sharp && Svgo

Unplugin-imagemin supports two compression modes 

 [Sharp](https://github.com/lovell/sharp) The typical use case for this high speed Node.js module is to convert large images in common formats to smaller, web-friendly JPEG, PNG, WebP, GIF and AVIF images of varying dimensions.

 [Squoosh](https://github.com/GoogleChromeLabs/squoosh) is an image compression web app that reduces image sizes through numerous formats.
 **Squoosh** with rust & wasm 

 [Svgo](https://github.com/svg/svgo) Support compression of pictures in svg format

## ✨Warning

Although squoosh has done a good job, there will be all kinds of problems in future node versions, so don't use squoosh mode for the time being.

Due to the loading problem of `squoosh`, unplugin-imagmin currently only supports versions below node 18.

Due to the rapid update of vite version and squoosh stop maintenance and other unstable factors

It is recommended that mode choose `sharp`.

## 🍰 Effect display
https://github.com/unplugin/unplugin-imagemin/assets/66500121/a3354463-f8cb-4bab-b769-61894365330f



## 📦 Installation

```bash
pnpm add unplugin-imagemin@latest -D
```

#### support vite and rollup.


<details>
<summary>Basic</summary><br>

```ts
import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import imagemin from 'unplugin-imagemin/vite';
// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    vue(),   
    imagemin()
  ]
});
```

<br></details>



<details>
<summary>Advanced</summary><br>

```ts
import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import imagemin from 'unplugin-imagemin/vite';
// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    vue(),   
    imagemin({
      // Default mode squoosh. support squoosh and sharp
      mode: 'sharp',
      // Default configuration options for compressing different pictures
      compress: {
        jpg: {
          quality: 70,
        },
        jpeg: {
          quality: 70,
        },
        png: {
          quality: 70,
        },
        webp: {
          quality: 70,
        },
      },
      // The type of picture converted after the build
      conversion: [
        { from: 'png', to: 'jpeg' },
        { from: 'jpeg', to: 'webp' },
      ]
    })
  ]
});
```

<br></details>

## 🌸 DefaultConfiguration

Squoosh DefaultConfiguration and sharp DefaultConfiguration

DefaultConfiguration see [DefaultConfiguration](https://github.com/ErKeLost/unplugin-imagemin/blob/main/src/core/compressOptions.ts) 

Plugin property configuration see [configuration](https://github.com/ErKeLost/unplugin-imagemin/blob/main/src/core/types/index.ts) 

```bash
export interface PluginOptions {
  /**
   * @description Picture compilation and conversion
   * @default []
   */
  conversion?: ConversionItemType[];
  /**
   * @description Whether to turn on caching
   * @default true
   * TODO: Not realized
   */
  cache?: boolean;
  /**
   * @description Cache folder directory read
   * @default node_modules/unplugin-imagemin/cache
   *
   */
  cacheDir?: string;
  /**
   * @description Compilation attribute
   * @default CompressTypeOptions
   */
  compress?: CompressTypeOptions;
  /**
   * @description mode
   * @default squoosh
   * @description squoosh or sharp
   */
  mode?: 'squoosh' | 'sharp';
  /**
   * @description Whether to compress before packing
   * @default false
   */
  beforeBundle?: boolean;
}
```
