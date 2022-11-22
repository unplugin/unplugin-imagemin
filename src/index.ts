import { createUnplugin } from 'unplugin';
import * as kolorist from 'kolorist'
import path from 'node:path';
import { createFilter } from '@rollup/pluginutils'
import os from 'node:os';
import * as fs from 'node:fs';
import { ImagePool } from '@squoosh/lib';
import { defaultOptions } from './core/types';
import * as color from './core/log'
import { partial } from 'filesize'


import ora from 'ora';
const size = partial({base: 2, standard: "jedec"});
// const spinner = ora('Loading unicorns').start();

// setTimeout(() => {
//   spinner.color = 'yellow';
//   spinner.text = 'Loading rainbows';
// }, 1000);
// @ts-ignore
const extRE = /\.(png|jpeg|jpg|webp|wb2|avif)$/i;
export default createUnplugin<any | undefined>((options = {}): any => {
  let outputPath: string;
  let outputDir: string;
  let publicDir: string
  let files: any = [];
  const filter = createFilter(
    options.include || [extRE],
    options.exclude || [/[\\/]node_modules[\\/]/],
  )
  return {
    name: 'unplugin-imagemin',
    apply: 'build',
    enforce: 'post',
    transformInclude(id) {
      return filter(id)
    },
    async transform(code, id) {
      console.log(code, id);
      // console.log(this.getAssetFileName('wallhaven-gpjm3d.png'));
      // console.log(this.getChunkFileName('wallhaven-gpjm3d.png'));
      
      code.replace('png', 'webp')
    },
    // transform(code) {
    //   return code.replace('__UNPLUGIN__', `Hello Unplugin! ${options}`);
    // },
    // configResolved(resolvedConfig) {
    //   outputDir = resolvedConfig.build.outDir
    //   publicDir = resolvedConfig.publicDir
    //   outputPath = path.resolve(
    //     resolvedConfig.root,
    //     resolvedConfig.build.outDir,
    //   );
    // },
    // async generateBundle(_, bundler) {
    //   Object.keys(bundler).forEach((key) => {
    //     filterFile(path.resolve(outputPath, key), extRE) && files.push(key);
    //   });
    //   if (!files.length) {
    //     return;
    //   }
    // },
    // async closeBundle() {
    //   if (!files.length) {
    //     return;
    //   }
    //   const res = kolorist.blue('📦 📦 [unplugin-imagemin]')
    //   const info = kolorist.gray('Process start ...')
    //   console.log(res, info);
    //   const defaultSquooshOptions = {};
    //   Object.keys(defaultOptions).forEach(
    //     (key) => (defaultSquooshOptions[key] = { ...defaultOptions[key] }),
    //   );
    //   const imagePool = new ImagePool(os.cpus().length);
    //   const images = files.map(async (filePath: string) => {
    //     const fileRootPath = path.resolve(outputPath, filePath);
    //     const start = Date.now();
    //     const image = imagePool.ingestImage(path.resolve(outputPath, filePath));
    //     const oldSize = fs.lstatSync(fileRootPath).size;
    //     let newSize = oldSize;
    //     const ext = path.extname(path.resolve(outputPath, filePath)) ?? '';
    //     const type = getUserCompressType()
    //     await image.encode({ [type]: defaultSquooshOptions[type] });
    //     const encodedWith = await image.encodedWith[type]
    //     newSize = encodedWith.size;
    //     if (newSize < oldSize) {
    //       fs.writeFileSync(`${fileRootPath}`, encodedWith.binary);
    //       console.log(kolorist.blue(filePath), kolorist.green(size(newSize).toString()), kolorist.magenta(`${Date.now() - start}ms`))
    //     }
    //     return null;
    //   });
    //   // console.log(images);
    //   await Promise.all(images)
    //   console.log(kolorist.yellow('✨ ✨ Successfully'));
    //   imagePool.close()
    // },
  };
});
// function filterFile(
//   file: string,
//   filter: RegExp | ((file: string) => boolean),
// ) {
//   if (filter) {
//     const isRe = isRegExp(filter);
//     const isFn = isFunction(filter);
//     if (isRe) {
//       return (filter as RegExp).test(file);
//     }
//     if (isFn) {
//       return (filter as (file: any) => any)(file);
//     }
//   }
//   return false;
// }
// export const isFunction = (arg: unknown): arg is (...args: any[]) => any =>
//   typeof arg === 'function';

// export const isRegExp = (arg: unknown): arg is RegExp =>
//   Object.prototype.toString.call(arg) === '[object RegExp]';

// function getUserCompressType(type: string = 'webp') {
//   return type
// }
