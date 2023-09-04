import chalk from 'chalk';
import path from 'pathe';
import * as fs from 'node:fs';
import { compressSuccess, logger } from './log';
import { optimize } from 'svgo';

export default async function initSvgo(config, filePath: string) {
  const { outputPath, cache, chunks, options, publicDir } = config;
  const fileRootPath = path.resolve(outputPath, filePath);
  if (options.cache && cache.get(chunks[filePath])) {
    fs.writeFileSync(fileRootPath, cache.get(chunks[filePath]));
    logger(chalk.blue(filePath), chalk.green('✨ The file has been cached'));
    return Promise.resolve();
  }

  const start = performance.now();

  const oldSize = fs.lstatSync(fileRootPath).size;

  const svgCode = await fs.promises.readFile(fileRootPath, 'utf8');

  const result = optimize(svgCode, {
    // optional but recommended field
    // path, // all config fields are also available here
    multipass: true,
  });
  let newSize = Buffer.byteLength(result.data);
  const unixPath = path.normalize(fileRootPath);
  const relativePath = path.relative(process.cwd(), unixPath);
  compressSuccess(relativePath, newSize, oldSize, start);

  const svgBinaryData = Buffer.from(result.data, 'utf-8');
  if (filePath.startsWith(publicDir)) {
    const relativePathRace = path.relative(publicDir, fileRootPath);

    const finalPath = path.join(outputPath, relativePathRace);
    fs.writeFileSync(finalPath, svgBinaryData);
  } else {
    fs.writeFileSync(fileRootPath, svgBinaryData);
  }
}
