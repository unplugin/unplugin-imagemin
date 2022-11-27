import sharp from 'sharp';
import path from 'node:path';
import * as fs from 'node:fs';
import { encodeMap, encodeMapBack } from './encodeMap';
import { compressSuccess } from './log';
// `${root}/src/assets/image/wallhaven.png`,
// `${root}/dist/assets/wallhaven.jpeg`,
async function initSharp(files, outputPath, options, isTurn) {
  const images = files.map(async (filePath: string) => {
    const fileRootPath = path.resolve(outputPath, filePath);
    const start = Date.now();
    const oldSize = fs.lstatSync(fileRootPath).size;
    let newSize = oldSize;
    const ext = path.extname(path.resolve(outputPath, filePath)).slice(1) ?? '';
    const res = options.conversion.find((item) => `${item.from}`.includes(ext));
    const type = isTurn ? res?.to : encodeMapBack.get(ext);
    const current: any = encodeMap.get(type);
    const image = sharp(fileRootPath);
    const filepath = `${fileRootPath.replace(ext, isTurn ? current : ext)}`;
    const newFile = await image.toFile(filepath);
    newSize = newFile.size;
    if (newSize < oldSize) {
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
