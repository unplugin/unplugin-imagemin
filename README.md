
<div align="right">
  <details>
    <summary >🌐 Language</summary>
    <div>
      <div align="right">
        <p><a href="https://openaitx.github.io/view.html?user=unplugin&project=unplugin-imagemin&lang=en">English</a></p>
        <p><a href="https://openaitx.github.io/view.html?user=unplugin&project=unplugin-imagemin&lang=zh-CN">简体中文</a></p>
        <p><a href="https://openaitx.github.io/view.html?user=unplugin&project=unplugin-imagemin&lang=zh-TW">繁體中文</a></p>
        <p><a href="https://openaitx.github.io/view.html?user=unplugin&project=unplugin-imagemin&lang=ja">日本語</a></p>
        <p><a href="https://openaitx.github.io/view.html?user=unplugin&project=unplugin-imagemin&lang=ko">한국어</a></p>
        <p><a href="https://openaitx.github.io/view.html?user=unplugin&project=unplugin-imagemin&lang=hi">हिन्दी</a></p>
        <p><a href="https://openaitx.github.io/view.html?user=unplugin&project=unplugin-imagemin&lang=th">ไทย</a></p>
        <p><a href="https://openaitx.github.io/view.html?user=unplugin&project=unplugin-imagemin&lang=fr">Français</a></p>
        <p><a href="https://openaitx.github.io/view.html?user=unplugin&project=unplugin-imagemin&lang=de">Deutsch</a></p>
        <p><a href="https://openaitx.github.io/view.html?user=unplugin&project=unplugin-imagemin&lang=es">Español</a></p>
        <p><a href="https://openaitx.github.io/view.html?user=unplugin&project=unplugin-imagemin&lang=it">Itapano</a></p>
        <p><a href="https://openaitx.github.io/view.html?user=unplugin&project=unplugin-imagemin&lang=ru">Русский</a></p>
        <p><a href="https://openaitx.github.io/view.html?user=unplugin&project=unplugin-imagemin&lang=pt">Português</a></p>
        <p><a href="https://openaitx.github.io/view.html?user=unplugin&project=unplugin-imagemin&lang=nl">Nederlands</a></p>
        <p><a href="https://openaitx.github.io/view.html?user=unplugin&project=unplugin-imagemin&lang=pl">Polski</a></p>
        <p><a href="https://openaitx.github.io/view.html?user=unplugin&project=unplugin-imagemin&lang=ar">العربية</a></p>
        <p><a href="https://openaitx.github.io/view.html?user=unplugin&project=unplugin-imagemin&lang=fa">فارسی</a></p>
        <p><a href="https://openaitx.github.io/view.html?user=unplugin&project=unplugin-imagemin&lang=tr">Türkçe</a></p>
        <p><a href="https://openaitx.github.io/view.html?user=unplugin&project=unplugin-imagemin&lang=vi">Tiếng Việt</a></p>
        <p><a href="https://openaitx.github.io/view.html?user=unplugin&project=unplugin-imagemin&lang=id">Bahasa Indonesia</a></p>
      </div>
    </div>
  </details>
</div>

# 📦📦 unplugin Imagemin Picture compression

[![NPM version](https://img.shields.io/npm/v/unplugin-imagemin?color=a1b858&label=)](https://www.npmjs.com/package/unplugin-imagemin)

> [!IMPORTANT]
> **Tips:**
> `1.0 goals` unplugin-imagemin is preparing to release version 1.0, which will be released after achieving the following goals

- [x] Support all node versions by re-modifying the wasm syntax of squoosh
- [x] remove sharp deps
- [x] support compress publicDir images
- [x] support css compress image
- [x] Supports full cache mode
- [x] Support Node 22 and more
- [x] Type options
- [ ] Supports farm, rsbuild, webpack, and other frameworks

> [!WARNING]
New features and stability, compatibility and performance features are constantly being updated
Recommended to use the latest version  `pnpm add unplugin-imagemin@latest -D`

> [!WARNING]
Since Google [squoosh](https://github.com/GoogleChromeLabs/squoosh) no longer maintains the node direction, This fock came out and revised some compatibility issues. Details [squoosh-next](https://github.com/ErKeLost/squoosh-node-latest)

### ✨✨ Continuous iterative development in testing

```bash
✨ : unplugin-imagemin
✔ : Process start with mode squoosh
✅ : [test1.png] [12.39 MB] -> [102.54 KB]
✔ : Process start with mode squoosh
✅ : [test2.png] [16.38 MB] -> [76.79 KB]
```

#### 🌈 Features

- 🍰 Support png jpeg webp avif svg tiff Format
- 🦾 High Performance based on squoosh
- ✨ Multiple picture formats can be configured
- 🪐 Compress the code at build time
- 😃 Caching Mechanism
- 🌈 You can convert different picture types at build time

## Squoosh && Svgo

Unplugin-imagemin supports two compression tools

[Squoosh](https://github.com/GoogleChromeLabs/squoosh) is an image compression web app that reduces image sizes through numerous formats.
**Squoosh** with rust & wasm

[Svgo](https://github.com/svg/svgo) Support compression of pictures in svg format

## 📦 Installation

```bash
pnpm add unplugin-imagemin@latest -D
```

#### support vite and rollup

<details>
<summary>Basic</summary><br>

```ts
import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import imagemin from 'unplugin-imagemin/vite';
// https://vitejs.dev/config/
export default defineConfig({
  plugins: [vue(), imagemin()],
});
```

<br></details>

<details>
<summary>Advanced</summary><br>

```ts
iimport { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import imagemin from 'unplugin-imagemin/vite';
// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    vue(),
    imagemin({
      // default true
      cache: false,
      // Default configuration options for compressing different pictures
      compress: {
        jpg: {
          quality: 10,
        },
        jpeg: {
          quality: 10,
        },
        png: {
          quality: 10,
        },
        webp: {
          quality: 10,
        },
      },
      conversion: [
        { from: 'jpeg', to: 'webp' },
        { from: 'png', to: 'webp' },
        { from: 'JPG', to: 'jpeg' },
      ],
    }),
  ],
});

```

<br></details>

## 🌸 DefaultConfiguration

Squoosh DefaultConfiguration

DefaultConfiguration see [DefaultConfiguration](https://github.com/ErKeLost/unplugin-imagemin/blob/main/src/core/compressOptions.ts)

Plugin property configuration see [configuration](https://github.com/ErKeLost/unplugin-imagemin/blob/main/src/core/types/index.ts)

```typescript
export interface PluginOptions {
  /**
   * @description Picture compilation and conversion
   * @default []
   */
  conversion?: ConversionItemType[];
  /**
   * @description Whether to turn on caching
   * @default true
   */
  cache?: boolean;
  /**
   * @description Path to the cache file location
   * @default ./node_modules/.cache/unplugin-imagemin/.unplugin-imagemin-cache
   */
  cacheLocation?: string;
  /**
   * @description Compilation attribute
   * @default CompressTypeOptions
   */
  compress?: CompressTypeOptions;
}
```
