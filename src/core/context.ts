import fs from 'node:fs/promises';
import { Buffer } from 'node:buffer';
import { cpus } from 'node:os';
import { performance } from 'node:perf_hooks';

import { basename, extname, join, resolve } from 'pathe';
import { createFilter } from '@rollup/pluginutils';
import { optimize } from 'svgo';
import chalk from 'chalk';
import SquooshPool from 'squoosh-next';

import { encodeMap, encodeMapBack } from './encodeMap';
import {
  exists,
  filterFile,
  getBundleImageSrc,
  hasImageFiles,
  isSvgFile,
  isTurnImageType,
  parseId,
  transformFileName,
  updateCssReferences,
} from './utils';
import { defaultOptions } from './compressOptions';
import devalue from './devalue';
import { compressSuccess, logger, pluginTitle } from './log';
import { loadWithRocketGradient } from './gradient';

import type { ResolvedConfig } from 'vite';
import type { PluginOptions, ResolvedOptions } from './types';
import Cache from './cache';

export const cssUrlRE =
  /(?<=^|[^\w\-\u0080-\uffff])url\((\s*('[^']+'|"[^"]+")\s*|[^'")]+)\)/;

export const extImageRE = /\.(png|jpeg|jpg|webp|wb2|avif|svg)$/i;

interface ProcessedResult {
  fileName: string;
  name: string;
  source: Buffer | string;
  isAsset: boolean;
  type: 'asset';
}

export default class Context {
  config!: ResolvedOptions;

  mergeConfig!: ResolvedOptions;

  imageModulePath: string[] = [];

  imagePool: SquooshPool.ImagePool | undefined;

  files: string[] = [];

  assetPath: string[] = [];

  cache: Cache | undefined;

  filter = createFilter(extImageRE, [
    /[\\/]node_modules[\\/]/,
    /[\\/]\.git[\\/]/,
  ]);

  /**
   * @param ResolvedConfig
   * configResolved hook  
   * Parsing user parameters and vite parameters
   */

  handleResolveOptionHook(
    userConfig: ResolvedConfig & { options: PluginOptions },
  ) {
    const {
      base,
      command,
      root,
      build: { assetsDir, outDir },
      options,
      publicDir,
    } = userConfig;
    const cwd = process.cwd();
    const isBuild = command === 'build';
    const isTurn = isTurnImageType(options.conversion);
    const outputPath = resolve(root, outDir);
    const cacheLocation =
      options.cacheLocation ??
      join(
        root,
        'node_modules',
        '.cache',
        'unplugin-imagemin',
        '.unplugin-imagemin-cache',
      );
    const chooseConfig = {
      base,
      command,
      root,
      cwd,
      outDir,
      assetsDir,
      options: {
        ...options,
        compress: options.compress || {},
        cache: options.cache ?? true,
      },
      isBuild,
      cacheLocation,
      outputPath,
      isTurn,
      publicDir,
    } as unknown as ResolvedOptions;
    this.mergeConfig = resolveOptions(defaultOptions, chooseConfig);
    this.config = chooseConfig;

    this.cache = new Cache(cacheLocation);
  }

  private async resolveImagePath(id: string): Promise<string | null> {
    if (this.config?.publicDir) {
      const fileName = id.replace(/^\//, '');
      const publicPath = resolve(this.config.publicDir, fileName);
      try {
        await fs.access(publicPath);
        return publicPath;
      } catch {
        return id;
      }
    }
    return id;
  }

  /**
   * @param id
   * @returns
   * load hooks
   * Parsing id returns custom content and then generates custom bundle
   */
  async loadBundleHook(id) {
    const exportValue = await this.generateDefaultValue(id);
    return exportValue;
  }

  /**
   * @param bundler
   * Dynamically generate chunk file according to the content of user-defined module obtained before building
   */
  async generateBundleHook(bundler) {
    const fileNameMap = new Map<string, string>();
    this.imagePool = new SquooshPool.ImagePool(cpus().length);

    this.startGenerateLogger();
    const spinner = await loadWithRocketGradient('');
    const tasks = [];

    for (const [fileName, asset] of Object.entries(bundler)) {
      if (asset.type === 'asset' && extImageRE.test(fileName)) {
        const path = resolve(this.config.root, asset.originalFileName);

        const mtimeMs = (await fs.stat(path)).mtimeMs;
        const ext = extname(path).slice(1) ?? '';
        const userRes = this.config.options.conversion.find((i) =>
          `${i.from}`.endsWith(ext),
        );

        if (
          this.config.options.cache &&
          this.cache?.hasCachedAsset(path, {
            mtimeMs,
            targetExtname: userRes?.to || ext,
          })
        ) {
          const cachedAsset = this.cache.get(path);
          if (cachedAsset) {
            logger(
              chalk.bold(chalk.green('✨ Using cached of')),
              chalk.bold(chalk.cyan(basename(cachedAsset.fileName))),
            );
            fileNameMap.set(asset.fileName, cachedAsset.fileName);
            continue;
          }
        }

        const task = async () => {
          if (!isSvgFile(path)) {
            return {
              originFileName: asset.fileName,
              result: await this.processRasterImage(path),
            };
          }
          return {
            originFileName: asset.fileName,
            result: await this.processSvg(path),
          };
        };

        tasks.push(task());
      }
    }
    const baseResult = await Promise.all(tasks);
    // biome-ignore lint/complexity/noForEach: <explanation>
    baseResult.forEach(({ originFileName, result }) => {
      if (result) {
        fileNameMap.set(originFileName, result.result.fileName);
      }
    });

    let taskIndex = 0;
    for (const [fileName, asset] of Object.entries(bundler)) {
      if (asset.type === 'asset' && extImageRE.test(fileName)) {
        const result = baseResult[taskIndex++];
        if (result) {
          asset.fileName = result.result.fileName;
          asset.source = result.result.source;
        }
      }
    }

    for (const [fileName, asset] of Object.entries(bundler)) {
      if (
        asset.type === 'asset' &&
        fileName.endsWith('.css') &&
        fileNameMap.size
      ) {
        const cssContent = asset.source.toString();
        const updatedCss = updateCssReferences(cssContent, fileNameMap);
        asset.source = updatedCss;
      }
    }
    if (this.imageModulePath.length) {
      const generateImageBundle = this.imageModulePath?.map(async (item) => {
        if (!isSvgFile(item)) {
          return await this.processRasterImage(item);
        }
        // transform svg
        return this.processSvg(item);
      });
      const result = await Promise.all(generateImageBundle);

      this.generateBundleFile(bundler, result);
      logger(pluginTitle('✨'), chalk.yellow('Image conversion completed!'));
    }
    this.imagePool?.close();
    spinner.stop();
  }

  setAssetsPath(pathStr) {
    this.assetPath.push(pathStr);
  }

  filterBundleFile(bundle) {
    Object.keys(bundle).forEach((key) => {
      const { outputPath } = this.config;
      filterFile(resolve(outputPath, key), extImageRE) && this.files.push(key);
    });
  }

  async generateDefaultValue(id) {
    const parser = parseId(id);
    const absolutePath = await this.resolveImagePath(parser.path);
    this.imageModulePath.push(absolutePath);
    this.imageModulePath.filter((item) => Boolean(item));
    const generateSrc = getBundleImageSrc(absolutePath, this.config.options);
    const base = basename(parser.path, extname(parser.path));

    const generatePath = join(
      `${this.config.base}${this.config.assetsDir}`,
      `${base}-${generateSrc}`,
    );
    return `export default ${devalue(generatePath)}`;
  }

  // squoosh
  async processRasterImage(item: string): Promise<ProcessedResult | undefined> {
    const stats = await fs.lstat(item);
    const start = performance.now();
    const oldSize = stats.size;
    let newSize = oldSize;
    const ext = extname(item).slice(1) ?? '';
    const userRes = this.config.options.conversion.find((i) =>
      `${i.from}`.endsWith(ext),
    );

    if (this.config.options.cache && this.cache) {
      const cachedInfo = this.cache.get<ProcessedResult>(item);
      if (
        cachedInfo &&
        this.cache.hasCachedAsset(item, {
          mtimeMs: stats.mtimeMs,
          targetExtname: userRes?.to || ext,
        })
      ) {
        logger(
          chalk.bold(chalk.green('✨ Using cached of')),
          chalk.bold(chalk.cyan(basename(cachedInfo.fileName))),
        );
        return cachedInfo;
      }
    }
    // const itemConversion = this.config.isTurn && userRes?.from === ext;
    const type =
      this.config.isTurn && userRes?.to
        ? encodeMapBack.get(userRes?.to)
        : encodeMapBack.get(ext);
    const imageFile = await fs.readFile(item);

    const image = this.imagePool.ingestImage(imageFile);
    const generateSrc = getBundleImageSrc(item, this.config.options);
    const baseDir = basename(item, extname(item));
    const imageName = `${baseDir}-${generateSrc}`;
    const defaultSquooshOptions = {};
    // biome-ignore lint/complexity/noForEach: <explanation>
    Object.keys(defaultOptions).forEach(
      // biome-ignore lint/suspicious/noAssignInExpressions: <explanation>
      (key) => (defaultSquooshOptions[key] = { ...this.mergeConfig[key] }),
    );
    const currentType = {
      [type!]: defaultSquooshOptions[type!],
    };

    try {
      await image.encode(currentType);
    } catch (error) {
      logger(pluginTitle('(!)'), chalk.yellow(error));
      return;
    }
    const { base, assetsDir, outDir } = this.config;

    const encodedWith = await image.encodedWith[type!];

    newSize = encodedWith.size;

    const source: ProcessedResult = {
      fileName: join(assetsDir, imageName),
      name: imageName,
      source: encodedWith.binary,
      isAsset: true,
      type: 'asset',
    };

    if (this.config.options.cache && this.cache) {
      this.cache.setCachedAsset(
        item,
        {
          mtimeMs: stats.mtimeMs,
          targetExtname: extname(source.fileName).slice(1),
        },
        source,
      );
    }

    compressSuccess(
      join(base, outDir, source.fileName),
      newSize,
      oldSize,
      start,
    );

    return source;
  }

  generateBundleFile(bundler, result) {
    // biome-ignore lint/complexity/noForEach: <explanation>
    result.forEach((asset) => {
      bundler[asset.fileName] = asset;
    });
  }

  startGenerateLogger() {
    const info = chalk.gray(`Process start with ${chalk.bold('Squoosh')}`);
    logger('\n', pluginTitle('📦'), info);
  }

  async isCache(cacheFilePath) {
    return this.config.options.cache && exists(cacheFilePath);
  }

  async spinnerHooks(fn) {
    if (!this.files.length && !hasImageFiles(this.config.publicDir)) {
      return false;
    }
    const spinner = await loadWithRocketGradient('');
    await fn.call(this);
    logger(pluginTitle('✨'), chalk.yellow('Image conversion completed!'));
    spinner.stop();
  }

  async processSvg(item: string): Promise<ProcessedResult> {
    const { assetsDir, outDir, base: configBase } = this.config;
    const svgCode = await fs.readFile(item, 'utf8');

    const result = optimize(svgCode, {
      // optional but recommended field
      // path, // all config fields are also available here
      multipass: true,
    });

    const generateSrc = getBundleImageSrc(item, this.config.options);
    const base = basename(item, extname(item));
    const imageName = `${base}-${generateSrc}`;
    const start = performance.now();
    const size = await fs.lstat(item);

    const oldSize = size.size;
    const newSize = Buffer.byteLength(result.data);
    const svgResult: ProcessedResult = {
      fileName: join(assetsDir, imageName),
      name: imageName,
      source: result.data,
      isAsset: true,
      type: 'asset',
    };

    if (this.config.options.cache && this.cache) {
      this.cache.setCachedAsset(
        item,
        {
          mtimeMs: (await fs.stat(item)).mtimeMs,
          targetExtname: extname(imageName).slice(1),
        },
        svgResult,
      );
    }

    compressSuccess(
      join(configBase, outDir, svgResult.fileName),
      newSize,
      oldSize,
      start,
    );
    return svgResult;
  }
}

export function resolveOptions(
  defaultOpts: Partial<ResolvedOptions>,
  configOpts: Partial<ResolvedOptions>,
): ResolvedOptions {
  const transformType = transformEncodeType(configOpts.options?.compress);
  const keys = Object.keys(transformType);
  const res = keys.map((item) => ({
    ...defaultOpts[item],
    ...transformType[item],
  }));

  const obj = {} as Record<string, unknown>;
  keys.forEach((item, index) => {
    obj[item] = res[index];
  });

  return {
    ...defaultOpts,
    ...configOpts,
    ...obj,
  } as ResolvedOptions;
}

export function transformEncodeType(options: Record<string, unknown> = {}) {
  const newCompressOptions: Record<string, unknown> = {};
  const transformKeys = Object.keys(options).map((item) =>
    encodeMapBack.get(item),
  );
  const transformOldKeys = Object.keys(options);
  transformKeys.forEach((item, index) => {
    if (item) {
      newCompressOptions[item] = options[transformOldKeys[index]];
    }
  });
  return newCompressOptions;
}

// transform resolve code
export async function transformCode(
  options,
  currentChunk,
  changeBundle,
  sourceCode,
) {
  // biome-ignore lint/complexity/noForEach: <explanation>
  currentChunk.forEach(async (item: any) => {
    const finallyPath = join(options.outputPath, item.fileName);
    // biome-ignore lint/complexity/noForEach: <explanation>
    options.options.conversion.forEach(
      (type: { from: string | RegExp; to: string }) => {
        // biome-ignore lint/complexity/noForEach: <explanation>
        changeBundle.forEach(async (file) => {
          if (file.endsWith(type.from)) {
            const name = transformFileName(file);
            item[sourceCode] = item[sourceCode].replaceAll(
              `${name}${type.from}`,
              `${name}${encodeMap.get(type.to)}`,
            );
          }
        });
      },
    );
    await fs.writeFile(finallyPath, item[sourceCode]);
  });
}

async function sleep(time) {
  return new Promise((resolve) => {
    setTimeout(resolve, time);
  });
}
