import { createUnplugin } from 'unplugin';
import { createFilter } from '@rollup/pluginutils';
import { ImagePool } from '@squoosh/lib';
import chalk from 'chalk';

import path from 'node:path';
import os from 'node:os';
import * as fs from 'node:fs';

import Context from './core/context';
import { defaultOptions } from './core/types';
import { pluginTitle, compressSuccess } from './core/log';
import { loadWithRocketGradient } from './core/gradient';
import { filterFile, isTurnImageType } from './core/utils';

import { encodeMap, encodeMapBack } from './core/encodeMap';
import Cache from './core/cache';

const extRE = /\.(png|jpeg|jpg|webp|wb2|avif)$/i;
export default createUnplugin<any | undefined>((options = {}): any => {
  const files: any = [];
  let chunks: any;
  let cache: any;
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
      console.log(config.outputPath);

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
      console.log(outputPath);

      if (!files.length) {
        return false;
      }
      const info = chalk.gray('Process start');
      console.log(pluginTitle('📦'), info);
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
      const imagePool = new ImagePool(os.cpus().length);
      const images = files.map(async (filePath: string): Promise<any> => {
        const fileRootPath = path.resolve(outputPath!, filePath);
        if (options.cache && cache.get(chunks[filePath])) {
          fs.writeFileSync(fileRootPath, cache.get(chunks[filePath]));
          console.log(chalk.blue(filePath), chalk.green('from disk cached'));
          return Promise.resolve();
        }
        const start = Date.now();
        const image = imagePool.ingestImage(
          path.resolve(outputPath!, filePath),
        );
        const oldSize = fs.lstatSync(fileRootPath).size;
        let newSize = oldSize;
        const ext =
          path.extname(path.resolve(outputPath!, filePath)).slice(1) ?? '';
        const res = options.conversion.find((item) =>
          `${item.from}`.includes(ext),
        );
        const type = isTurn ? res?.to : encodeMapBack.get(ext);
        const current: any = encodeMap.get(type);
        await image.encode({
          [type!]: defaultSquooshOptions[type!],
        });
        const encodedWith = await image.encodedWith[type];
        newSize = encodedWith.size;
        if (newSize < oldSize) {
          const filepath = `${fileRootPath.replace(
            ext,
            isTurn ? current : ext,
          )}`;
          fs.writeFileSync(filepath, encodedWith.binary);
          if (options.cache && !cache.get(chunks[filePath])) {
            cache.set(chunks[filePath], encodedWith.binary);
          }
          if (isTurn) {
            fs.unlinkSync(fileRootPath);
          }
          compressSuccess(
            `${filepath.replace(process.cwd(), '')}`,
            newSize,
            oldSize,
            start,
          );
        }
      });
      await Promise.all(images);
      imagePool.close();
      console.log(pluginTitle('✨'), chalk.yellow('Successfully'));
      if (!options.cache) {
        spinner.text = chalk.yellow('Image conversion completed!');
        spinner.succeed();
      }
    },
  };
});
