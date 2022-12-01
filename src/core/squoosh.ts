import { ImagePool } from '@squoosh/lib';
import os from 'node:os';
import path from 'node:path';
import * as fs from 'node:fs';
import { encodeMap, encodeMapBack } from './encodeMap';
import { compressSuccess, logger } from './log';
import chalk from 'chalk';

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
  const imagePool = new ImagePool(os.cpus().length);
  const images = files.map(async (filePath: string) => {
    const fileRootPath = path.resolve(outputPath, filePath);
    if (options.cache && cache.get(chunks[filePath])) {
      fs.writeFileSync(fileRootPath, cache.get(chunks[filePath]));
      logger(chalk.blue(filePath), chalk.green('✨ The file has been cached'));
      return Promise.resolve();
    }
    const start = Date.now();
    const image = imagePool.ingestImage(path.resolve(outputPath, filePath));
    const oldSize = fs.lstatSync(fileRootPath).size;
    let newSize = oldSize;
    const ext = path.extname(path.resolve(outputPath, filePath)).slice(1) ?? '';
    const res = options.conversion.find((item) => `${item.from}`.includes(ext));
    const itemConversion = isTurn && res?.from === ext;
    const type = itemConversion ? res?.to : encodeMapBack.get(ext);
    const current: any = encodeMap.get(type);
    await image.encode({
      [type!]: defaultSquooshOptions[type!],
    });
    // TODO 有些类型不能转换 切记 文档要写
    const encodedWith = await image.encodedWith[type];
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
        `${filepath.replace(process.cwd(), '')}`,
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
