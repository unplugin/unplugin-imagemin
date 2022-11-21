import { createUnplugin } from 'unplugin';
// import chalk from 'chalk'
// import Debug from 'debug'
// import type { Options } from './types'
// Options
import path from 'node:path';
import os from 'node:os';
import fs from 'node:fs';
import { ImagePool } from '@squoosh/lib';
import { defaultOptions } from './core/types';
// const imagePool = new ImagePool();
// @ts-ignore
// const extRE = /\.(png|jpeg|gif|jpg|bmp|svg)$/i
const extRE = /\.(png|jpeg|jpg)$/i;
export default createUnplugin<any | undefined>((options) => {
  let outputPath: string;
  let files: any = [];
  // let publicDir: string
  // let config: any
  // console.log(options);
  return {
    name: 'unplugin-imagemin',
    apply: 'build',
    enforce: 'post',
    transformInclude(id) {
      return id.endsWith('main.ts');
    },

    transform(code) {
      return code.replace('__UNPLUGIN__', `Hello Unplugin! ${options}`);
    },
    configResolved(resolvedConfig) {
      // console.log(resolvedConfig.publicDir);
      // console.log(resolvedConfig.build.outDir);
      outputPath = path.resolve(
        resolvedConfig.root,
        resolvedConfig.build.outDir,
      );
    },
    async generateBundle(_, bundler) {
      // const files: string[] = []
      // console.log(outputPath, 'out put path 路径');

      Object.keys(bundler).forEach((key) => {
        filterFile(path.resolve(outputPath, key), extRE) && files.push(key);
      });
      // console.log(files, '拿到过滤文件信息');
      if (!files.length) {
        return;
      }

      // 结构构造
      // const handles = files.map((filePath: string) => {
      //   return bundler[filePath].source
      // })
      // const pool = handles.map((filePath: string) => (
      //   imagePool.ingestImage(filePath)
      // ))
      // console.log(pool);
      // const images = files.map((filePath: string) => {
      //   return imagePool.ingestImage(path.resolve(outputPath, filePath))
      // })
      // console.log(images);
      // console.log(handles);
    },
    async closeBundle() {
      const defaultSquooshOptions = {};
      Object.keys(defaultOptions).forEach(
        (key) => (defaultSquooshOptions[key] = { ...defaultOptions[key] }),
      );
      const imagePool = new ImagePool(os.cpus().length);
      const images = files.map(async (filePath: string) => {
        const fileRootPath = path.resolve(outputPath, filePath);
        const start = Date.now();
        // console.log(start);

        const image = imagePool.ingestImage(path.resolve(outputPath, filePath));
        const oldSize = fs.lstatSync(fileRootPath).size;
        let newSize = oldSize;
        const ext = path.extname(path.resolve(outputPath, filePath)) ?? '';
        const encodeTo = options.encodeTo?.find((value) => value.from.test(ext)).to;
        // console.log(ext, "图片后缀");
        // console.log(newSize, "图片大小");
        // console.log(defaultSquooshOptions, '参数类型');
        for (let i = 0; i < Object.values(defaultSquooshOptions).length; i++) {
          const codec = Object.values(defaultSquooshOptions)[i];
          // console.log(codec);
          const encoderType = Object.keys(defaultSquooshOptions)[i];
          if (typeof encodeTo !== 'undefined') {
            if (encodeTo != encoderType) continue;
          } else if (!codec.extension?.test(ext)) continue;

          let newCodec = {};

          newCodec[Object.keys(defaultSquooshOptions)[i]] = codec;
          // console.log(newCodec);

          await image.encode(newCodec);
          // console.log(Object.values(image.encodedWith));
          const encodedWith = await (Object.values(
            image.encodedWith,
          )[0] as Promise<any>);
          newSize = encodedWith.size;
          if (newSize < oldSize) {
            fs.mkdirSync(path.dirname(fileRootPath), { recursive: true });
            fs.writeFileSync(fileRootPath, encodedWith.binary);
          }

          break;
        }
        // await image.encode(defaultSquooshOptions);
        // // console.log(Object.values(image.encodedWith));

        // const encodedWith = await (Object.values(
        //   image.encodedWith,
        // )[5] as Promise<any>);
        // console.log(encodedWith);
        // newSize = encodedWith.size;
        // if (newSize < oldSize) {
        //   fs.mkdirSync(path.dirname(fileRootPath), { recursive: true });
        //   fs.writeFileSync(fileRootPath, encodedWith.binary);
        // }
        console.log(`${Date.now() - start}ms`, '结束时间');

        return null;
      });
      // console.log(images);
    },
  };
});
function filterFile(
  file: string,
  filter: RegExp | ((file: string) => boolean),
) {
  if (filter) {
    const isRe = isRegExp(filter);
    const isFn = isFunction(filter);
    if (isRe) {
      return (filter as RegExp).test(file);
    }
    if (isFn) {
      return (filter as (file: any) => any)(file);
    }
  }
  return false;
}
export const isFunction = (arg: unknown): arg is (...args: any[]) => any =>
  typeof arg === 'function';

export const isRegExp = (arg: unknown): arg is RegExp =>
  Object.prototype.toString.call(arg) === '[object RegExp]';
