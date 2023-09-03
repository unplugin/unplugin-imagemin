// import { ImagePool } from '@squoosh/lib';
import os from 'node:os';
import path from 'node:path';
import * as fs from 'node:fs';
import { extname } from 'pathe';

import { encodeMap, encodeMapBack } from './encodeMap';
import { compressSuccess, logger } from './log';
import chalk from 'chalk';
const CurrentNodeVersion = parseInt(process.version.slice(1), 10);
const SquooshErrorVersion = 18;
const SquooshUseFlag = CurrentNodeVersion < SquooshErrorVersion;
let SquooshPool;
if (SquooshUseFlag) {
  import('@squoosh/lib')
    .then((module) => {
      // 加载模块成功后执行的代码
      SquooshPool = module.ImagePool;
      delete globalThis.navigator;
    })
    .catch((err) => {
      // 加载模块失败后执行的代码
      console.log(err);
    });
}
async function initSquoosh(config) {
  const {
    files,
    outputPath,
    cache,
    chunks,
    options,
    isTurn,
    defaultSquooshOptions,
  } = config;
  let imagePool;
  if (options.mode === 'squoosh') {
    imagePool = new SquooshPool(os.cpus().length);
  }
  const images = files.map(async (filePath: string) => {
    if (extname(filePath) === '.svg') return;
    const fileRootPath = path.resolve(outputPath, filePath);
    if (options.cache && cache.get(chunks[filePath])) {
      fs.writeFileSync(fileRootPath, cache.get(chunks[filePath]));
      logger(chalk.blue(filePath), chalk.green('✨ The file has been cached'));
      return Promise.resolve();
    }
    const image = imagePool.ingestImage(path.resolve(outputPath, filePath));
    const oldSize = fs.lstatSync(fileRootPath).size;
    let newSize = oldSize;
    const ext = path.extname(path.resolve(outputPath, filePath)).slice(1) ?? '';
    const res = options.conversion.find((item) => `${item.from}`.includes(ext));
    const itemConversion = isTurn && res?.from === ext;
    const type = itemConversion
      ? encodeMapBack.get(res?.to)
      : encodeMapBack.get(ext);
    const start = performance.now();
    // Decode image
    await image.decoded;
    const current: any = encodeMap.get(type!);
    await image.encode({
      [type!]: defaultSquooshOptions[type!],
    });

    // TODO 有些类型不能转换 切记 文档要写
    const encodedWith = await image.encodedWith[type!];
    newSize = encodedWith.size;

    if (newSize < oldSize) {
      const filepath = `${fileRootPath.replace(
        ext,
        itemConversion ? current : ext,
      )}`;
      fs.writeFileSync(filepath, encodedWith.binary);

      if (options.cache && !cache.get(chunks[filePath])) {
        cache.set(chunks[filePath], encodedWith.binary);
      }
      if (itemConversion) {
        fs.unlinkSync(fileRootPath);
      }

      compressSuccess(
        `${filepath.replace(process.cwd(), '').slice(1)}`,
        newSize,
        oldSize,
        start,
      );
    }
  });
  await Promise.all(images);
  imagePool.close();
}

export default initSquoosh;
