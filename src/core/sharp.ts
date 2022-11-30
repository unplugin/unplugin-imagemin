import sharp from 'sharp';
import path from 'node:path';
import * as fs from 'node:fs';
import { promises as proFs } from 'fs';
import { encodeMap, encodeMapBack } from './encodeMap';
import { compressSuccess, logger } from './log';
import chalk from 'chalk';
import { extname } from 'pathe';
async function initSharp(config) {
  const { files, outputPath, cache, chunks, options, inputPath, isTurn } =
    config;
  const images = files.map(async (filePath: string, index: number) => {
    const fileRootPath = path.resolve(outputPath, filePath);
    if (options.cache && cache.get(chunks[filePath])) {
      fs.writeFileSync(fileRootPath, cache.get(chunks[filePath]));
      logger(chalk.blue(filePath), chalk.green('✨ The file has been cached'));
      return Promise.resolve();
    }
    const start = Date.now();
    const oldSize = fs.lstatSync(fileRootPath).size;
    let newSize = oldSize;
    const ext = path.extname(path.resolve(outputPath, filePath)).slice(1) ?? '';
    const res = options.conversion.find((item) => `${item.from}`.includes(ext));
    const type = isTurn ? res?.to : encodeMapBack.get(ext);
    const current: any = encodeMap.get(type);
    const filepath = `${fileRootPath.replace(ext, isTurn ? current : ext)}`;
    const image = await sharp(fileRootPath);
    const currentType = options.conversion.find(
      (item) => item.from === extname(fileRootPath).slice(1),
    );
    const buffer = await image
      .png({
        quality: 50,
      })
      .toBuffer();
    let resultBuffer;
    const fileExt = extname(fileRootPath).slice(1);
    if (currentType !== undefined) {
      resultBuffer = await sharp(fileRootPath)
        [currentType.to](options.compress[currentType.to])
        .toBuffer();
    } else {
      resultBuffer = await sharp(fileRootPath)
        [fileExt]({
          quality: 50,
        })
        .toBuffer();
    }
    await proFs.writeFile(filepath, resultBuffer);
    const data = await proFs.stat(filepath);
    newSize = data.size;
    if (newSize < oldSize) {
      if (options.cache && !cache.get(chunks[filePath])) {
        cache.set(chunks[filePath], await proFs.readFile(filepath));
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
}
export function loadImage(url: string) {
  return sharp(decodeURIComponent(parseURL(url).pathname));
}
function parseURL(rawURL: string) {
  return new URL(rawURL.replace(/#/g, '%23'), 'file://');
}
export default initSharp;
