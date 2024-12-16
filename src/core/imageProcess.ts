// ImageProcessor.ts
import fs from 'node:fs/promises';
import { cpus } from 'node:os';
import { extname, basename, join } from 'pathe';
import { ImagePool } from 'squoosh';
import { optimize } from 'svgo';
import { performance } from 'node:perf_hooks';
import type { ResolvedOptions } from './types';
import { isSvgFile, getBundleImageSrc } from './Utils';

export default class ImageProcessor {
  private imagePool: ImagePool;

  private options: ResolvedOptions;

  private cache: Cache;

  constructor(options: ResolvedOptions, cache: Cache) {
    this.options = options;
    this.cache = cache;
    this.imagePool = new ImagePool(cpus().length);
  }

  // /**
  //  * 处理图像文件，支持常规图像和 SVG
  //  * @param filePath 图像文件的路径
  //  * @returns 处理后的图像信息
  //  */
  async processImage(
    filePath: string,
  ): Promise<{ fileName: string; source: Buffer | string }> {
    if (isSvgFile(filePath)) {
      return this.processSvg(filePath);
    }
    return this.processRasterImage(filePath);
  }

  /**
   * 处理常规光栅图像（如 PNG、JPEG、WEBP 等）
   * @param filePath 图像文件的路径
   * @returns 处理后的图像信息
   */
  private async processRasterImage(
    filePath: string,
  ): Promise<{ fileName: string; source: Buffer }> {
    const startTime = performance.now();
    const { ext } = this.getFileInfo(filePath);

    const userConversion = this.options.conversion.find(
      (item) => item.from === ext,
    );

    const targetType = userConversion?.to ?? ext;
    const imageId = getBundleImageSrc(filePath, this.options);
    const imageName = `${basename(
      filePath,
      extname(filePath),
    )}-${imageId}.${targetType}`;
    const outputFilePath = join(this.options.assetsDir, imageName);

    // const fileStat = await fs.stat(filePath);
    // const cacheKey = `${filePath}-${targetType}`;
    // const isCached = await this.cache.hasCachedAsset(cacheKey, fileStat.mtimeMs);

    // if (isCached) {
    //   Logger.info(`Using cached image for ${filePath}`);
    //   const cachedData = await this.cache.getCachedAsset(cacheKey);
    //   return { fileName: outputFilePath, source: cachedData };
    // }

    const imageBuffer = await fs.readFile(filePath);
    const image = this.imagePool.ingestImage(imageBuffer);

    const encodeOptions = this.getEncodeOptions(targetType);
    if (!encodeOptions) {
      throw new Error(`Unsupported target image type: ${targetType}`);
    }

    try {
      await image.encode({ [targetType]: encodeOptions });
    } catch (error) {
      Logger.error(`Error encoding image ${filePath}`, error as Error);
      throw error;
    }

    const encodedImage = await image.encodedWith[targetType];
    const newSize = encodedImage.size;
    const oldSize = imageBuffer.length;

    // 保存缓存
    await this.cache.setCachedAsset(cacheKey, encodedImage.binary);

    const timeSpent = (performance.now() - startTime).toFixed(2);
    // Logger.success(
    //   `Compressed ${filePath} [${(oldSize / 1024).toFixed(2)} KB -> ${(newSize / 1024).toFixed(2)} KB] in ${timeSpent} ms`
    // );

    return {
      fileName: outputFilePath,
      source: encodedImage.binary,
    };
  }

  private async processSvg(
    filePath: string,
  ): Promise<{ fileName: string; source: string }> {
    const startTime = performance.now();

    const svgContent = await fs.readFile(filePath, 'utf8');
    const result = optimize(svgContent, {
      multipass: true,
      path: filePath,
    });

    if ('data' in result) {
      const optimizedSvg = result.data;
      const oldSize = Buffer.byteLength(svgContent, 'utf8');
      const newSize = Buffer.byteLength(optimizedSvg, 'utf8');

      // await this.cache.setCachedAsset(filePath, optimizedSvg);

      const imageId = getBundleImageSrc(filePath, this.options);
      const imageName = `${basename(filePath, '.svg')}-${imageId}.svg`;
      const outputFilePath = join(this.options.assetsDir, imageName);

      const timeSpent = (performance.now() - startTime).toFixed(2);
      Logger.success(
        `Optimized SVG ${filePath} [${(oldSize / 1024).toFixed(2)} KB -> ${(
          newSize / 1024
        ).toFixed(2)} KB] in ${timeSpent} ms`,
      );

      return {
        fileName: outputFilePath,
        source: optimizedSvg,
      };
    }
    // log(`Error optimizing SVG ${filePath}`, result.error as Error);
    throw new Error(`Failed to optimize SVG: ${result.error}`);
  }

  private getFileInfo(filePath: string): { base: string; ext: string } {
    const base = basename(filePath);
    const ext = extname(filePath).slice(1); // 去掉扩展名前的点
    return { base, ext };
  }

  private getEncodeOptions(targetType: string): Record<string, any> | null {
    switch (targetType) {
      case 'avif':
        return this.options.compress.avif;
      case 'webp':
        return this.options.compress.webp;
      case 'mozjpeg':
        return this.options.compress.mozjpeg;
      case 'oxipng':
        return this.options.compress.oxipng;
      default:
        return null;
    }
  }

  async close() {
    await this.imagePool.close();
  }
}
