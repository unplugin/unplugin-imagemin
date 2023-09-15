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
  const images = config.files.map((filePath) =>
    processImageFile(filePath, config),
  );
  await Promise.all(images);
}

async function processImageFile(filePath: string, config: any) {
  const {
    outputPath,
    cache,
    chunks,
    options,
    isTurn,
    defaultSquooshOptions,
    publicDir,
  } = config;
  let imagePool;
  if (options.mode === 'squoosh') {
    imagePool = new SquooshPool(os.cpus().length);
  }
  if (extname(filePath) === '.svg') return;

  const fileRootPath = path.resolve(outputPath, filePath);

  try {
    await fs.promises.access(fileRootPath, fs.constants.F_OK);
  } catch (error) {
    return;
  }

  if (options.cache && cache.get(chunks[filePath])) {
    await fs.promises.writeFile(fileRootPath, cache.get(chunks[filePath]));
    logger(chalk.blue(filePath), chalk.green('✨ The file has been cached'));
    return;
  }

  const oldSize = (await fs.promises.stat(fileRootPath)).size;
  let newSize = oldSize;
  const ext = path.extname(fileRootPath).slice(1) ?? '';
  const res = options.conversion.find((item) => `${item.from}`.includes(ext));
  const itemConversion = isTurn && res?.from === ext;
  const type = itemConversion
    ? encodeMapBack.get(res?.to)
    : encodeMapBack.get(ext);
  const start = performance.now();

  const image = imagePool.ingestImage(path.resolve(outputPath, filePath));

  await image.decoded;

  await image.encode({
    [type!]: defaultSquooshOptions[type!],
  });

  const encodedWith = await image.encodedWith[type!];
  newSize = encodedWith.size;

  if (newSize < oldSize) {
    const filepath = `${fileRootPath.replace(
      ext,
      itemConversion ? type : ext,
    )}`;
    const relativePathRace = path.relative(publicDir, fileRootPath);

    const finalPath = path.join(outputPath, relativePathRace);
    if (filePath.startsWith(publicDir)) {
      const paths = `${finalPath.replace(ext, itemConversion ? type : ext)}`;
      await fs.promises.writeFile(paths, encodedWith.binary);
    } else {
      await fs.promises.writeFile(filepath, encodedWith.binary);
    }

    if (options.cache && !cache.get(chunks[filePath])) {
      cache.set(chunks[filePath], encodedWith.binary);
    }
    if (itemConversion && !filePath.startsWith(publicDir)) {
      await fs.promises.unlink(fileRootPath);
    }
    if (filePath.startsWith(publicDir)) {
      await fs.promises.unlink(finalPath);
    }
    compressSuccess(
      `${filepath.replace(process.cwd(), '').slice(1)}`,
      newSize,
      oldSize,
      start,
    );
  }
  imagePool.close();
}

export default initSquoosh;
