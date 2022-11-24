import { createUnplugin } from 'unplugin';
import * as kolorist from 'kolorist';
import { createFilter } from '@rollup/pluginutils';
import { ImagePool } from '@squoosh/lib';

import path from 'node:path';
import os from 'node:os';
import * as fs from 'node:fs';

import Context from './core/context';
import { defaultOptions } from './core/types';
import { pluginTitle, compressSuccess } from './core/log';
import { loadWithRocketGradient } from './core/gradient';
import { filterFile, getUserCompressType } from './core/utils';

import { encodeMap } from './core/encodeMap';

const extRE = /\.(png|jpeg|jpg|webp|wb2|avif)$/i;
export default createUnplugin<any | undefined>((options = {}): any => {
  let outputPath: string;
  let outputDir: string;
  let publicDir: string;
  let files: any = [];
  const filter = createFilter(
    options.include || [extRE],
    options.exclude || [/[\\/]node_modules[\\/]/],
  );
  const ctx = new Context(options);

  return {
    name: 'unplugin-imagemin',
    apply: 'build',
    enforce: 'post',
    // transformInclude(id) {
    //   return filter(id);
    //   return id.endsWith('.vue')
    // },
    // async transform(code, id) {
    // },
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
      ctx.handlerMergeOption(defaultOptions);
      console.log(ctx.mergeOption);
    },
    async generateBundle(_, bundler) {
      // console.log(Object.keys(bundler));
      // console.log(
      //   Object.values(bundler)
      //     .filter((item) => item.type === 'chunk')[0]
      //     .code.replace('png', 'webp'),
      // );
      // const preloadMarker = `__VITE_PRELOAD__`;
      // for (const file in bundler) {
      //   const chunk = bundler[file];
      //   if (chunk.type === 'chunk') {
      //     chunk.code = chunk.code.replace(/png/g, 'webp');
      //     // console.log(chunk.code);
      //   }
      // }

      // bundler.code.replace('png', 'webp')
      Object.keys(bundler).forEach((key) => {
        filterFile(path.resolve(outputPath, key), extRE) && files.push(key);
      });
      if (!files.length) {
        /* empty */
      }
    },
    // async closeBundle() {
    //   const info = kolorist.gray('Process start');
    //   console.log(pluginTitle('📦'), info);
    //   // start spinner
    //   const spinner = await loadWithRocketGradient('');
    //   const defaultSquooshOptions = {};
    //   Object.keys(defaultOptions).forEach(
    //     (key) => (defaultSquooshOptions[key] = { ...defaultOptions[key] }),
    //   );
    //   const imagePool = new ImagePool(os.cpus().length);
    //   const images = files.map(async (filePath: string, index: number) => {
    //     const fileRootPath = path.resolve(outputPath, filePath);
    //     const start = Date.now();
    //     const image = imagePool.ingestImage(path.resolve(outputPath, filePath));
    //     const oldSize = fs.lstatSync(fileRootPath).size;
    //     let newSize = oldSize;
    //     const ext =
    //       path.extname(path.resolve(outputPath, filePath)).slice(1) ?? '';
    //     // const type = getUserCompressType(options.conversion[index].to);
    //     const { to: type } = options.conversion.find((item) =>
    //       `${item.from}`.includes(ext),
    //     );
    //     const current: any = encodeMap.get(type);
    //     await image.encode({ [type]: defaultSquooshOptions[type] });
    //     const encodedWith = await image.encodedWith[type];
    //     newSize = encodedWith.size;
    //     if (newSize < oldSize) {
    //       const filepath = `${fileRootPath.replace(ext, current)}`;
    //       fs.writeFileSync(filepath, encodedWith.binary);
    //       fs.unlinkSync(fileRootPath);
    //       compressSuccess(
    //         `${filepath.replace(process.cwd(), '')}`,
    //         newSize,
    //         oldSize,
    //         start,
    //       );
    //     }
    //   });
    //   await Promise.all(images);
    //   console.log(pluginTitle('✨'), kolorist.yellow('Successfully'));
    //   const a = await fs.readdirSync(`${outputDir}/assets`);
    //   const b = a.find((item) => item.endsWith('.js'));
    //   let r: any = null;
    //   const c = await fs.readFileSync(`${outputDir}/assets/${b}`);
    //   files.forEach(async (file, index) => {
    //     const type = getUserCompressType(options.conversion[index]?.to);
    //     const from = getUserCompressType(options.conversion[index]?.from);
    //     const current: any = encodeMap.get(type);
    //     if (!!r) {
    //       r = r.toString().replace(from, current);
    //     } else {
    //       r = c.toString().replace(from, current);
    //     }
    //   });
    //   await fs.writeFileSync(`${outputDir}/assets/${b}`, r);
    //   spinner.text = kolorist.yellow('File conversion completed!');
    //   spinner.succeed();
    //   imagePool.close();
    // },
  };
});
