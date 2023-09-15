import sharp from 'sharp';
import path from 'node:path';
import * as fs from 'node:fs';
import { promises as proFs } from 'fs';
import { encodeMap, sharpEncodeMap } from './encodeMap';
import { compressSuccess, logger } from './log';
import chalk from 'chalk';
import { extname } from 'pathe';
import { sharpOptions } from './compressOptions';
async function processImageFile(filePath: string, config: any) {
  const { outputPath, cache, chunks, options, isTurn, publicDir } = config;
  if (extname(filePath) === '.svg') return;

  const fileRootPath = path.resolve(outputPath, filePath);

  try {
    await proFs.access(fileRootPath, fs.constants.F_OK);
  } catch (error) {
    return;
  }

  if (options.cache && cache.get(chunks[filePath])) {
    await proFs.writeFile(fileRootPath, cache.get(chunks[filePath]));
    logger(chalk.blue(filePath), chalk.green('✨ The file has been cached'));
    return;
  }

  const start = performance.now();
  const oldSize = (await proFs.stat(fileRootPath)).size;
  let newSize = oldSize;
  const ext = path.extname(fileRootPath).slice(1) ?? '';
  const res = options.conversion.find((item) => `${item.from}`.includes(ext));
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
      [sharpEncodeMap.get(ext)!](option)
      .toBuffer();
  }

  const relativePathRace = path.relative(publicDir, filepath);
  const finalPath = path.join(outputPath, relativePathRace);
  const deletePath = path.join(outputPath, path.relative(publicDir, filePath));
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
      await proFs.unlink(fileRootPath);
    }
    if (filePath.startsWith(publicDir)) {
      await proFs.unlink(deletePath);
    }
    compressSuccess(
      filepath.replace(process.cwd(), ''),
      newSize,
      oldSize,
      start,
    );
  }
}

async function initSharp(config) {
  const images = config.files.map((filePath: string) =>
    processImageFile(filePath, config),
  );
  await Promise.all(images);
}
export default initSharp;
