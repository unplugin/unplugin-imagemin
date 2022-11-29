import { createUnplugin } from 'unplugin';
import chalk from 'chalk';
import { createFilter } from '@rollup/pluginutils';
import path, { extname } from 'node:path';
import fs from 'node:fs';
import os from 'node:os';
import initSquoosh from './core/squoosh';
import devalue from './core/devalue';
import Context, { exists } from './core/context';
import { defaultOptions } from './core/types';
import { logger, pluginTitle } from './core/log';
import { loadWithRocketGradient } from './core/gradient';
import { filterFile, isTurnImageType, parseId } from './core/utils';
import { ImagePool } from '@squoosh/lib';
import Cache from './core/cache';
import initSharp from './core/sharp';
import { encodeMapBack } from './core/encodeMap';
import { mkdir } from 'node:fs/promises';

const extRE = /\.(png|jpeg|jpg|webp|wb2|avif)$/i;
export default createUnplugin<any | undefined>((options = {}): any => {
  const files: any = [];
  let chunks: any;
  let cache: any;
  let configOption: any;
  const ctx = new Context();
  if (!options.conversion) {
    options.conversion = [];
  }
  if (!options.mode) {
    options.mode = 'sharp';
  }
  return {
    name: 'unplugin-imagemin',
    apply: 'build',
    enforce: 'pre',
    // { base, command, root, build }
    async configResolved(config) {
      // const config = {
      //   base,
      //   root,
      //   build,
      //   isBuild: command === 'build',
      //   cacheDir: path.join(
      //     root,
      //     'node_modules',
      //     '.cache',
      //     'unplugin-imagemin',
      //   ),
      //   ...options,
      //   outputPath: path.resolve(root, build.outDir),
      //   // 判断 是否 需要转换类型
      //   isTurn: isTurnImageType(options.conversion),
      //   ...defaultOptions,
      // };
      configOption = config;
      ctx.handleMergeOptionHook({ ...config, options });
    },
    async load(id) {
      if (options.beforeBundle) {
        const res = ctx.loadBundleHook(id);
        if (res) {
          return res;
        }
      }
    },
    async generateBundle(_, bundler) {
      if (options.beforeBundle) {
        // 生成动态bundle
        await ctx.generateBundleHook(bundler);
      } else {
        ctx.TransformChunksHook(bundler);
      }
    },
    async closeBundle() {
      ctx.closeBundleHook();
    },
  };
});
