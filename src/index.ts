import { createUnplugin } from 'unplugin';
import * as kolorist from 'kolorist';
import { createFilter } from '@rollup/pluginutils';
import { ImagePool } from '@squoosh/lib';

import path from 'node:path';
import os from 'node:os';
import * as fs from 'node:fs';

import { defaultOptions } from './core/types';
import { pluginTitle, compressSuccess } from './core/log'
import { loadWithRocketGradient } from './core/gradient';
import { filterFile, getUserCompressType } from './core/utils'

import { encodeMap } from './core/encodeMap'

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
  return {
    name: 'unplugin-imagemin',
    apply: 'build',
    enforce: 'post',

    // TODO transform 修改图片上下文 如果切换文件类型 需要修改 打包之后的 file ext
    // TODO context
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
    async generateBundle(_, bundler) {
      Object.keys(bundler).forEach((key) => {
        filterFile(path.resolve(outputPath, key), extRE) && files.push(key);
      });
      if (!files.length) {
        return;
      }
    },
    async closeBundle() {
      const info = kolorist.gray('Process start ...');
      console.log(pluginTitle('📦'), info);
      // start spinner
      const spinner = await loadWithRocketGradient('')
      const defaultSquooshOptions = {};
      Object.keys(defaultOptions).forEach(
        (key) => (defaultSquooshOptions[key] = { ...defaultOptions[key] }),
      );
      const type = getUserCompressType(options.conversion[0].to);
      const current = encodeMap.get(type)
      const imagePool = new ImagePool(os.cpus().length);
      const images = files.map(async (filePath: string) => {
        const fileRootPath = path.resolve(outputPath, filePath);
        const start = Date.now();
        const image = imagePool.ingestImage(path.resolve(outputPath, filePath));
        const oldSize = fs.lstatSync(fileRootPath).size;
        let newSize = oldSize;
        const ext = path.extname(path.resolve(outputPath, filePath)).slice(1) ?? '';
        await image.encode({ [type]: defaultSquooshOptions[type] });
        const encodedWith = await image.encodedWith[type];
        newSize = encodedWith.size;
        if (newSize < oldSize) {
          fs.writeFileSync(`${fileRootPath.replace(ext, current)}`, encodedWith.binary);
          fs.unlinkSync(fileRootPath)
          compressSuccess(filePath, newSize, oldSize, start)
        }
      });
      await Promise.all(images);
      console.log(pluginTitle('✨'), kolorist.yellow('Successfully'));
      const a = await fs.readdirSync(`${outputDir}/assets`);
      const b = a.find((item) => {
        return item.endsWith('.js');
      });
      const c = await fs.readFileSync(`${outputDir}/assets/${b}`);
      const r = c.toString().replace(/png/g, current);
      await fs.writeFileSync(`${outputDir}/assets/${b}`, r)
      spinner.text = kolorist.yellow('File conversion completed!')
      spinner.succeed()
      imagePool.close();
    },
  };
});



