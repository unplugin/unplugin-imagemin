import chalk from 'chalk';
import path from 'pathe';
import * as fs from 'fs/promises'; // 使用 fs.promises 进行异步文件操作
import { compressSuccess, logger } from './log';
import { optimize } from 'svgo';
import { performance } from 'perf_hooks'; // 引入 performance

export default async function initSvgo(config, filePath) {
  const { outputPath, cache, chunks, options, publicDir } = config;
  const fileRootPath = path.resolve(outputPath, filePath);

  try {
    await fs.access(fileRootPath, fs.constants.F_OK);
  } catch (error) {
    return; // 返回一个 Promise.reject() 来指示错误
  }

  if (options.cache && cache.get(chunks[filePath])) {
    await fs.writeFile(fileRootPath, cache.get(chunks[filePath]));
    logger(chalk.blue(filePath), chalk.green('✨ The file has been cached'));
    return; // 返回一个 Promise.resolve() 来指示成功
  }

  const start = performance.now();
  const oldSize = (await fs.stat(fileRootPath)).size;

  const svgCode = await fs.readFile(fileRootPath, 'utf8');

  const result = optimize(svgCode, {
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
    await fs.writeFile(finalPath, svgBinaryData);
  } else {
    await fs.writeFile(fileRootPath, svgBinaryData);
  }
}
