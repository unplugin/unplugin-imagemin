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
      ctx.handleMergeOption({ ...config, options });
    },
    async load(id) {
      if (options.beforeBundle) {
        const res = ctx.loadBundle(id);
        if (res) {
          return `export default ${devalue(res)}`;
        }
      }
    },
    async generateBundle(_, bundler) {
      // chunks = bundler;
      if (options.beforeBundle) {
        // 生成动态bundle
        const res = await ctx.generateBundle();
        res.forEach((asset) => {
          bundler[asset.fileName] = asset;
        });
      } else {
        Object.keys(bundler).forEach((key) => {
          const { outputPath } = ctx.mergeOption;
          // eslint-disable-next-line no-unused-expressions
          filterFile(path.resolve(outputPath!, key), extRE) && files.push(key);
        });
        ctx.handleTransform(bundler);
      }
    },
    // // eslint-disable-next-line consistent-return
    async closeBundle() {
      if (!options.beforeBundle) {
        const { isTurn, outputPath } = ctx.mergeOption;
        if (!files.length) {
          return false;
        }
        const info = chalk.gray('Process start with');
        const modeLog = chalk.magenta(`Mode ${options.mode}`);
        logger(pluginTitle('📦'), info, modeLog);
        // start spinner
        let spinner;
        if (!options.cache) {
          spinner = await loadWithRocketGradient('');
        }
        const defaultSquooshOptions = {};
        Object.keys(defaultOptions).forEach(
          (key) => (defaultSquooshOptions[key] = { ...ctx.mergeOption[key] }),
        );
        if (options.cache) {
          cache = new Cache({ outputPath });
        }
        const initOptions = {
          files,
          outputPath,
          options,
          isTurn,
          cache,
          chunks,
        };
        if (options.mode === 'squoosh') {
          await initSquoosh({ ...initOptions, defaultSquooshOptions });
        } else if (options.mode === 'sharp') {
          await initSharp(initOptions);
        } else {
          throw new Error(
            '[unplugin-imagemin] Only squoosh or sharp can be selected for mode option',
          );
        }
        const root = process.cwd();
        const cacheDirectory = path.join(
          root,
          'node_modules',
          '.cache',
          'unplugin-imagemin',
        );
        logger(pluginTitle('✨'), chalk.yellow('Successfully'));
        if (!cacheDirectory || !options.cache) {
          spinner.text = chalk.yellow('Image conversion completed!');
          spinner.succeed();
        }
      }
      return true;
    },
  };
});
