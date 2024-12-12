import { encodeMap, encodeMapBack } from './encodeMap';
import { createFilter } from '@rollup/pluginutils';
import { Buffer } from 'node:buffer';
import { performance } from 'node:perf_hooks';
import { optimize } from 'svgo';
import type { ResolvedConfig } from 'vite';
import {
  exists,
  filterFile,
  generateImageID,
  hasImageFiles,
  isTurnImageType,
  parseId,
  transformFileName,
} from './utils';
import { basename, extname, join, resolve } from 'pathe';
import { mkdir } from 'node:fs/promises';
import { promises as fs } from 'fs';
import { defaultOptions } from './compressOptions';
import type { PluginOptions, ResolvedOptions } from './types';
import devalue from './devalue';
import chalk from 'chalk';
import { compressSuccess, logger, pluginTitle } from './log';
import { loadWithRocketGradient } from './gradient';
// import initSquoosh from './squoosh';
import initSvg from './svgo';
import { cpus } from 'os';
import process from 'node:process';

export const cssUrlRE =
  /(?<=^|[^\w\-\u0080-\uffff])url\((\s*('[^']+'|"[^"]+")\s*|[^'")]+)\)/;

export const extImageRE = /\.(png|jpeg|jpg|webp|wb2|avif|svg)$/i;

let SquooshPool;
import('squoosh-next')
  .then((module) => {
    SquooshPool = module.ImagePool;

    delete globalThis.navigator;
  })
  .catch(console.error);

export interface Options {
  compress: any;
}

export default class Context {
  config: ResolvedOptions | any;

  mergeConfig: any;

  mergeOption: any;

  imageModulePath: string[] = [];

  chunks: any;

  cache: any;

  files: string[] = [];

  assetPath: string[] = [];

  filter = createFilter(extImageRE, [
    /[\\/]node_modules[\\/]/,
    /[\\/]\.git[\\/]/,
  ]);

  /**
   * @param ResolvedConfig
   * configResolved hook  解析用户参数以及vite参数
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
    const cacheDir = join(
      root,
      'node_modules',
      options.cacheDir! ?? '.cache',
      'unplugin-imagemin',
    );
    const isTurn = isTurnImageType(options.conversion);
    const outputPath = resolve(root, outDir);
    const chooseConfig = {
      base,
      command,
      root,
      cwd,
      outDir,
      assetsDir,
      options,
      isBuild,
      cacheDir,
      outputPath,
      isTurn,
      publicDir,
    };
    this.mergeConfig = resolveOptions(defaultOptions, chooseConfig);
    this.config = chooseConfig;
  }

  /**
   * @param id
   * @returns
   * load hooks
   * Parsing id returns custom content and then generates custom bundle
   */
  loadBundleHook(id) {
    const exportValue = this.generateDefaultValue(id);
    return exportValue;
  }

  /**
   * @param bundler
   * Dynamically generate chunk file according to the content of user-defined module obtained before building
   */
  async generateBundleHook(bundler) {
    this.chunks = bundler;
    if (!(await exists(this.config.cacheDir))) {
      // TODO cache
      await mkdir(this.config.cacheDir, { recursive: true });
    }
    const imagePool = new SquooshPool(cpus().length);

    this.startGenerateLogger();
    const spinner = await loadWithRocketGradient('');

    if (this.imageModulePath.length) {
      const generateImageBundle = this.imageModulePath?.map(async (item) => {
        if (!isSvgFile(item)) {
          return await this.generateSquooshBundle(
            imagePool,
            item,
          );
        }
        // transform svg
        return this.generateSvgBundle(item);
      });
      const result = await Promise.all(generateImageBundle);

      this.generateBundleFile(bundler, result);
      logger(pluginTitle('✨'), chalk.yellow('Image conversion completed!'));
    }
    imagePool?.close();
    spinner.stop();
  }

  setAssetsPath(pathStr) {
    this.assetPath.push(pathStr);
  }

  filterBundleFile(bundle) {
    Object.keys(bundle).forEach((key) => {
      const { outputPath } = this.config;
      // eslint-disable-next-line no-unused-expressions
      filterFile(resolve(outputPath!, key), extImageRE) && this.files.push(key);
    });
  }

  generateDefaultValue(id) {
    const parser = parseId(id);

    this.imageModulePath.push(parser.path);
    const generateSrc = getBundleImageSrc(parser.path, this.config.options);
    const base = basename(parser.path, extname(parser.path));

    const generatePath = join(
      `${this.config.base}${this.config.assetsDir}`,
      `${base}-${generateSrc}`,
    );
    return `export default ${devalue(generatePath)}`;
  }

  // squoosh
  async generateSquooshBundle(imagePool, item) {
    const start = performance.now();
    const size = await fs.lstat(item);
    const oldSize = size.size;
    let newSize = oldSize;
    const ext = extname(item).slice(1) ?? '';
    const userRes = this.config.options.conversion.find((i) =>
      `${i.from}`.endsWith(ext),
    );
    // const itemConversion = this.config.isTurn && userRes?.from === ext;
    const type =
      this.config.isTurn && userRes?.to
        ? encodeMapBack.get(userRes?.to)
        : encodeMapBack.get(ext);
    const imageFile = await fs.readFile(item);

    const image = imagePool.ingestImage(imageFile);

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
    }
    const { base, assetsDir, outDir } = this.config;

    const encodedWith = await image.encodedWith[type!];

    newSize = encodedWith.size;

    const source = {
      fileName: join(assetsDir, imageName),
      name: imageName,
      source: encodedWith.binary,
      isAsset: true,
      type: 'asset',
    };
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

  async generateSvgBundle(item) {
    const svgCode = await fs.readFile(item, 'utf8');

    const result = optimize(svgCode, {
      // optional but recommended field
      // path, // all config fields are also available here
      multipass: true,
    });

    const generateSrc = getBundleImageSrc(item, this.config.options);
    const base = basename(item, extname(item));
    const { assetsDir, outDir } = this.config;
    const imageName = `${base}-${generateSrc}`;
    const start = performance.now();
    const size = await fs.lstat(item);

    const oldSize = size.size;
    const newSize = Buffer.byteLength(result.data);
    const svgResult = {
      fileName: join(assetsDir, imageName),
      name: imageName,
      source: result.data,
      isAsset: true,
      type: 'asset',
    };

    compressSuccess(
      join(this.config.base, outDir, svgResult.fileName),
      newSize,
      oldSize,
      start,
    );
    return svgResult;
  }

  async closeBundleFn() {
  }
}
async function writeImageFile(buffer, options, imageName): Promise<any> {
  const { cacheDir, assetsDir } = options;

  const cachedFilename = join(cacheDir, imageName);
  if (options.cache && (await exists(cachedFilename))) {
  }
  return {
    fileName: join(assetsDir, imageName),
    name: imageName,
    source: buffer,
    isAsset: true,
    type: 'asset',
  };
}


function getBundleImageSrc(filename: string, options: any) {
  const currentType =
    options.conversion.find(
      (item) => item.from === extname(filename).slice(1),
    ) ?? extname(filename).slice(1);
  const id = generateImageID(
    filename,
    currentType.to ?? extname(filename).slice(1),
  );
  return id;
}


export function resolveOptions(
  options: any,
  configOption: any,
): ResolvedOptions {
  const transformType = transformEncodeType(configOption.options?.compress);
  const keys = Object.keys(transformType);
  const res = keys.map(
    (item) =>
    ({
      ...options[item],
      ...transformType[item],
    } as ResolvedOptions),
  );
  const obj = {};
  keys.forEach((item, index) => {
    obj[item] = res[index];
  });
  return { ...options, ...obj } as ResolvedOptions;
}

export function transformEncodeType(options = {}) {
  const newCompressOptions: any = {};
  const transformKeys = Object.keys(options).map((item) =>
    encodeMapBack.get(item),
  );
  const transformOldKeys: any = Object.keys(options).map((item) => item);
  transformKeys.forEach((item: any, index: number) => {
    newCompressOptions[item] = options[transformOldKeys[index]];
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

export function isSvgFile(filename) {
  return extname(filename) === '.svg'
}
