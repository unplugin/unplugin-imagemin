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
import { filterFile, getUserCompressType, isTurnImageType } from './core/utils';

import { encodeMap, encodeMapBack } from './core/encodeMap';

const extRE = /\.(png|jpeg|jpg|webp|wb2|avif)$/i;
export default createUnplugin<any | undefined>((options = {}): any => {
  let outputPath: string;
  let outputDir: string;
  let publicDir: string;
  const files: any = [];
  const filter = createFilter(
    options.include || [extRE],
    options.exclude || [/[\\/]node_modules[\\/]/],
  );
  // 判断 是否 需要转换类型
  // TODO try catch 捕获
  const isTurn = isTurnImageType(options.conversion);
  const ctx = new Context(options);
  if (!options.conversion) {
    options.conversion = [];
  }
  return {
    name: 'unplugin-imagemin',
    apply: 'build',
    enforce: 'pre',
    // transformInclude(id) {
    //   return filter(id);
    //   return id.endsWith('.vue')
    // },
    // async transform(code, id) {
    // },
    // 构建阶段的通用钩子：在每个传入模块请求时被调用：可以自定义加载器，可用来返回自定义的内容
    configResolved(resolvedConfig) {
      outputDir = resolvedConfig.build.outDir;
      publicDir = resolvedConfig.publicDir;
      outputPath = path.resolve(
        resolvedConfig.root,
        resolvedConfig.build.outDir,
      );
    },
    buildEnd() {
      // 合并option
      // console.log('打包结束');
      ctx.handleMergeOption(defaultOptions);
    },
    async generateBundle(_, bundler) {
      Object.keys(bundler).forEach((key) => {
        // eslint-disable-next-line no-unused-expressions
        filterFile(path.resolve(outputPath, key), extRE) && files.push(key);
      });
      ctx.handleTransform(bundler);
      if (!files.length) {
        return false;
      }
      return true;
    },
    async closeBundle() {
      const info = chalk.gray('Process start');
      console.log(pluginTitle('📦'), info);
      // start spinner
      const spinner = await loadWithRocketGradient('');
      const defaultSquooshOptions = {};
      Object.keys(defaultOptions).forEach(
        (key) => (defaultSquooshOptions[key] = { ...ctx.mergeOption[key] }),
      );
      const imagePool = new ImagePool(os.cpus().length);
      const images = files.map(async (filePath: string, index: number) => {
        const fileRootPath = path.resolve(outputPath, filePath);
        const start = Date.now();
        const image = imagePool.ingestImage(path.resolve(outputPath, filePath));
        const oldSize = fs.lstatSync(fileRootPath).size;
        let newSize = oldSize;
        const ext =
          path.extname(path.resolve(outputPath, filePath)).slice(1) ?? '';
        // const type = getUserCompressType(options.conversion[index].to);
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
      console.log(pluginTitle('✨'), chalk.yellow('Successfully'));
      spinner.text = chalk.yellow('Image conversion completed!');
      spinner.succeed();
      imagePool.close();
    },
  };
});
