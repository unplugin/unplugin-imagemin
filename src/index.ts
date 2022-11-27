import { createUnplugin } from 'unplugin';
import chalk from 'chalk';

import path from 'node:path';
import initSquoosh from './core/squoosh';
// import devalue from './core/devalue';
import Context from './core/context';
import { defaultOptions } from './core/types';
import { pluginTitle } from './core/log';
import { loadWithRocketGradient } from './core/gradient';
import { filterFile, isTurnImageType } from './core/utils';

import Cache from './core/cache';
import initSharp from './core/sharp';

const extRE = /\.(png|jpeg|jpg|webp|wb2|avif)$/i;
export default createUnplugin<any | undefined>((options = {}): any => {
  const files: any = [];
  const ctx = new Context(options);
  if (!options.conversion) {
    options.conversion = [];
  }
  return {
    name: 'unplugin-imagemin',
    apply: 'build',
    enforce: 'pre',
    configResolved({ base, command, root, build }) {
      const config = {
        base,
        root,
        build,
        cacheDir: path.join(root, 'node_modules', '.images'),
        writeBundle: true,
        isBuild: command === 'build',
        outputPath: path.resolve(root, build.outDir),
        // 判断 是否 需要转换类型
        isTurn: isTurnImageType(options.conversion),
        ...defaultOptions,
      };
      ctx.handleMergeOption(config);
    },
    async generateBundle(_, bundler) {
      chunks = bundler;
      Object.keys(bundler).forEach((key) => {
        const { outputPath } = ctx.mergeOption;
        // eslint-disable-next-line no-unused-expressions
        filterFile(path.resolve(outputPath!, key), extRE) && files.push(key);
      });
      ctx.handleTransform(bundler);
      return true;
    },
    // eslint-disable-next-line consistent-return
    async closeBundle() {
      const { isTurn, outputPath } = ctx.mergeOption;
      if (!files.length) {
        return false;
      }
      const info = chalk.gray('Process start with');
      const modeLog = chalk.magenta(`Mode ${options.mode}`);
      console.log(pluginTitle('📦'), info, modeLog);
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

      console.log(pluginTitle('✨'), chalk.yellow('Successfully'));
      if (!options.cache) {
        spinner.text = chalk.yellow('Image conversion completed!');
        spinner.succeed();
      }
    },
  };
});
