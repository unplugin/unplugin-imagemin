import sharp from 'sharp';
import path from 'node:path';
import * as fs from 'node:fs';
import { promises as proFs } from 'fs';
import { encodeMap, encodeMapBack, sharpEncodeMap } from './encodeMap';
import { compressSuccess, logger } from './log';
import chalk from 'chalk';
import { extname } from 'pathe';
import { sharpOptions } from './compressOptions';
async function initSharp(config) {
  const { files, outputPath, cache, chunks, options, isTurn, publicDir } =
    config;
  const images = files.map(async (filePath: string) => {
    if (extname(filePath) === '.svg') return;
    const fileRootPath = path.resolve(outputPath, filePath);
    try {
      fs.accessSync(fileRootPath, fs.constants.F_OK);
    } catch (error) {
      return;
    }
    if (options.cache && cache.get(chunks[filePath])) {
      fs.writeFileSync(fileRootPath, cache.get(chunks[filePath]));
      logger(chalk.blue(filePath), chalk.green('✨ The file has been cached'));
      return Promise.resolve();
    }
    // raw
    // 强制输出为原始的、未压缩的uint8像素数据。
    // 返回sharp实例
    const start = performance.now();

    const oldSize = fs.lstatSync(fileRootPath).size;
    let newSize = oldSize;
    const ext = path.extname(path.resolve(outputPath, filePath)).slice(1) ?? '';
    const res = options.conversion.find((item) => `${item.from}`.includes(ext));
    // 当前item是否需要转换
    const itemConversion = isTurn && res?.from === ext;
    const type = itemConversion ? res?.to : sharpEncodeMap.get(ext);
    const current: any = encodeMap.get(type);
    const filepath = `${fileRootPath.replace(
      ext,
      itemConversion ? current : ext,
    )}`;
    const currentType = options.conversion.find(
      (item) => item.from === extname(fileRootPath).slice(1),
    );
    let resultBuffer;
    const fileExt = extname(fileRootPath).slice(1);
    if (currentType !== undefined) {
      const option = {
        ...sharpOptions[ext],
        ...options.compress[currentType.to],
      };

      resultBuffer = await sharp(fileRootPath)
        [sharpEncodeMap.get(currentType.to)!](option)
        .toBuffer();
    } else {
      const option = { ...sharpOptions[ext], ...options.compress[ext] };
      resultBuffer = await sharp(fileRootPath)
        [sharpEncodeMap.get(fileExt)!](option)
        .toBuffer();
    }

    const relativePathRace = path.relative(publicDir, filepath);

    const finalPath = path.join(outputPath, relativePathRace);
    const deletePath = path.join(
      outputPath,
      path.relative(publicDir, filePath),
    );
    let data;
    if (filePath.startsWith(publicDir)) {
      await proFs.writeFile(finalPath, resultBuffer);
      data = await proFs.stat(finalPath);
    } else {
      await proFs.writeFile(filepath, resultBuffer);
      data = await proFs.stat(filepath);
    }
    newSize = data.size;
    if (newSize < oldSize) {
      if (options.cache && !cache.get(chunks[filePath])) {
        cache.set(chunks[filePath], await proFs.readFile(filepath));
      }
      if (itemConversion && !filePath.startsWith(publicDir)) {
        fs.unlinkSync(fileRootPath);
      }
      if (filePath.startsWith(publicDir)) {
        fs.unlinkSync(deletePath);
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
}
export default initSharp;
