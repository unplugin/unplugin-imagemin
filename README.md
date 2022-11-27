# 📦📦 unplugin Imagemin Picture compression

[![NPM version](https://img.shields.io/npm/v/unplugin-imagemin?color=a1b858&label=)](https://www.npmjs.com/package/unplugin-imagemin)

### ✨✨ Continuous iterative development in testing

###### Features

- 🦾 High Performance based on squoosh
- ✨ Multiple picture formats can be configured
- 🪐 Compress the code at build time
- 😃 Caching Mechanism
- 🌈 You can convert different picture types at build time

## Squoosh && Sharp

Unplugin-imagemin supports two compression modes 

 [Sharp](https://github.com/lovell/sharp) The typical use case for this high speed Node.js module is to convert large images in common formats to smaller, web-friendly JPEG, PNG, WebP, GIF and AVIF images of varying dimensions.

 [Squoosh](https://github.com/GoogleChromeLabs/squoosh) is an image compression web app that reduces image sizes through numerous formats.
 **Squoosh** with rust & wasm 

## Build In the case of 60% quality with **Squoosh**
![image](https://user-images.githubusercontent.com/66500121/204133582-6a8d0472-9aea-4b53-b54f-fbde96439d25.png)


## Build In the case of 60% quality with **Sharp**
![image](https://user-images.githubusercontent.com/66500121/204133424-1404963a-3a26-4d7a-86d1-d809941d5dc1.png)



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
// https://vitejs.dev/config/
export default defineConfig({
  plugins: [vue(), imagemin(
  /* options */
  )],
});
```

<br></details>

<details>
<summary>Webpack</summary><br>

```ts
// webpack.config.js
module.exports = {
  /* ... */
  plugins: [
    require('imagemin/webpack')({
      /* options */
    }),
  ],
};
```

<br></details>

## Configuration

```ts
    imagemin({
      // mode Only squoosh or sharp can be selected for mode option
      mode: 'squoosh',
      // Default configuration options for compressing different pictures
      compress: {
        jpg: {
          quality: 0,
        },
        jpeg: {
          quality: 100,
        },
        png: {
          quality: 100,
        },
        webp: {
          quality: 100,
        },
      },

      // The type of picture converted after the build
      conversion: [
        { from: 'png', to: 'mozjpeg' },
        { from: 'jpeg', to: 'webp' },
      ],


      // Whether image caching is required defaults to true
      cache: false,
    }),
```

## Squoosh DefaultConfiguration

Six types are commonly supported in picture parsing. (MozJPEG | WebP | WebP2 | JPEG-XL | AVIF | OxiPNG)

**OxiPNG**
Png format converts webp format by default, but if you do not specify the conversion attribute, the suffix will not be modified.

### MozJPEG

```ts
    defaultEncoderOptions: {
      quality: 75,
      baseline: false,
      arithmetic: false,
      progressive: true,
      optimize_coding: true,
      smoothing: 0,
      color_space: 3 /*YCbCr*/,
      quant_table: 3,
      trellis_multipass: false,
      trellis_opt_zero: false,
      trellis_opt_table: false,
      trellis_loops: 1,
      auto_subsample: true,
      chroma_subsample: 2,
      separate_chroma_quality: false,
      chroma_quality: 75,
    },
```

### WebP

```ts
    defaultEncoderOptions: {
      quality: 75,
      target_size: 0,
      target_PSNR: 0,
      method: 4,
      sns_strength: 50,
      filter_strength: 60,
      filter_sharpness: 0,
      filter_type: 1,
      partitions: 0,
      segments: 4,
      pass: 1,
      show_compressed: 0,
      preprocessing: 0,
      autofilter: 0,
      partition_limit: 0,
      alpha_compression: 1,
      alpha_filtering: 1,
      alpha_quality: 100,
      lossless: 0,
      exact: 0,
      image_hint: 0,
      emulate_jpeg_size: 0,
      thread_level: 0,
      low_memory: 0,
      near_lossless: 100,
      use_delta_palette: 0,
      use_sharp_yuv: 0,
    },
```

### WebP2

```ts
    defaultEncoderOptions: {
      quality: 75,
      alpha_quality: 75,
      effort: 5,
      pass: 1,
      sns: 50,
      uv_mode: 0 /*UVMode.UVModeAuto*/,
      csp_type: 0 /*Csp.kYCoCg*/,
      error_diffusion: 0,
      use_random_matrix: false,
    },
```

### JPEG-XL

```ts
    defaultEncoderOptions: {
      effort: 1,
      quality: 75,
      progressive: false,
      epf: -1,
      lossyPalette: false,
      decodingSpeedTier: 0,
      photonNoiseIso: 0,
      lossyModular: false,
    },
```

### AVIF

```ts
    defaultEncoderOptions: {
      cqLevel: 33,
      cqAlphaLevel: -1,
      denoiseLevel: 0,
      tileColsLog2: 0,
      tileRowsLog2: 0,
      speed: 6,
      subsample: 1,
      chromaDeltaQ: false,
      sharpness: 0,
      tune: 0 /* AVIFTune.auto */,
    },
```

### OxiPNG

```ts
    defaultEncoderOptions: {
      level: 2,
    },
```


## Sharp DefaultConfiguration

## TODO

- sass moudle navigator web error (refactor)
- transform with unplugin context
- use cache in node_modules
- refactor user options
- Various types of pictures （Svg is not supported）
- pref If there is this type or picture, then continue to go down.
- transform get global ctx || context
- resolve generateBundle callback replace code
- Attribute compress test error
- Css module conversion
- refactor generateBundle before write chunk
- typescript Type hint
