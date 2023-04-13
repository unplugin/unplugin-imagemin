import { encodeMap, encodeMapBack, sharpEncodeMap } from './encodeMap';
import { createFilter } from '@rollup/pluginutils';
import { Blob, Buffer } from 'node:buffer';
import { optimize } from 'svgo';
import {
  filterFile,
  parseId,
  isTurnImageType,
  filterExtension,
  exists,
  generateImageID,
  transformFileName,
} from './utils';
import { basename, extname, join, resolve } from 'pathe';
import sharp from 'sharp';
import { mkdir } from 'node:fs/promises';
import { promises as fs } from 'fs';
import { defaultOptions, sharpOptions } from './compressOptions';
import type { ResolvedOptions } from './types';
import devalue from './devalue';
import chalk from 'chalk';
import { compressSuccess, logger, pluginTitle } from './log';
import { loadWithRocketGradient } from './gradient';
import Cache from './cache';
import initSquoosh from './squoosh';
import initSharp from './sharp';

// 切换整数字符串 尝试使用正则
const CurrentNodeVersion = parseInt(process.version.slice(1), 10);
const SquooshErrorVersion = 18;
const SquooshUseFlag = CurrentNodeVersion < SquooshErrorVersion;
let SquooshPool;
if (SquooshUseFlag) {
  import('@squoosh/lib')
    .then((module) => {
      // 加载模块成功后执行的代码
      SquooshPool = module.ImagePool;
      delete globalThis.navigator;
    })
    .catch((err) => {
      // 加载模块失败后执行的代码
      console.log(err);
    });
}
const extRE = /\.(png|jpeg|jpg|webp|wb2|avif)$/i;
const extSvgRE = /\.(png|jpeg|jpg|webp|wb2|avif|svg)$/i;

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

  filter = createFilter(extSvgRE, [
    /[\\/]node_modules[\\/]/,
    /[\\/]\.git[\\/]/,
  ]);

  /**
   * @param useConfig
   * configResolved hook  解析用户参数以及vite参数
   * Parsing user parameters and vite parameters
   */

  handleMergeOptionHook(useConfig: any) {
    const {
      base,
      command,
      root,
      build: { assetsDir, outDir },
      options,
    } = useConfig;
    const cwd = process.cwd();
    const isBuild = command === 'build';
    const cacheDir = join(
      root,
      'node_modules',
      options.cacheDir,
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
    };
    // squoosh & sharp merge config options
    this.mergeConfig = resolveOptions(defaultOptions, chooseConfig);
    this.config = chooseConfig;
  }

  /**
   *
   * @param id
   * @returns
   * load hooks  解析id 返回自定义内容 后续生成自定义bundle
   * Parsing id returns custom content and then generates custom bundle
   */
  loadBundleHook(id) {
    const imageModuleFlag = this.filter(id);
    const exportValue = this.generateDefaultValue(imageModuleFlag, id);
    return exportValue;
  }

  /**
   *
   * @param bundler
   * 根据构建前获取用户自定义模块内容 动态生成chunk file
   * Dynamically generate chunk file according to the content of user-defined module obtained before building
   */
  async generateBundleHook(bundler) {
    this.chunks = bundler;
    if (!(await exists(this.config.cacheDir))) {
      await mkdir(this.config.cacheDir, { recursive: true });
    }
    let imagePool;
    const { mode } = this.config.options;
    if (mode === 'squoosh' && SquooshUseFlag) {
      imagePool = new SquooshPool();
    }
    this.startGenerate();
    let spinner;
    spinner = await loadWithRocketGradient('');
    // console.log(this.imageModulePath);

    if (this.imageModulePath.length > 0) {
      const generateImageBundle = this.imageModulePath.map(async (item) => {
        if (extname(item) !== '.svg') {
          if (mode === 'squoosh' && SquooshUseFlag) {
            const squooshBundle = await this.generateSquooshBundle(
              imagePool,
              item,
            );
            return squooshBundle;
          } else if (mode === 'sharp') {
            const sharpBundle = await this.generateSharpBundle(item);
            return sharpBundle;
          }
          console.log(
            chalk.yellow(
              'Squoosh mode is not supported in node 18. Please use sharp.',
            ),
          );
        }
        const svgCode = await fs.readFile(item, 'utf8');
        const result = optimize(svgCode, {
          // optional but recommended field
          // path, // all config fields are also available here
          multipass: true,
        });
        const generateSrc = getBundleImageSrc(item, this.config.options);
        const base = basename(item, extname(item));
        const { assetsDir } = this.config;
        const imageName = `${base}-${generateSrc}`;
        return {
          fileName: join(assetsDir, imageName),
          name: imageName,
          source: result.data,
          isAsset: true,
          type: 'asset',
        };
      });
      const result = await Promise.all(generateImageBundle);
      if (mode === 'squoosh') {
        imagePool.close();
      }
      this.generateBundleFile(bundler, result);
      logger(pluginTitle('✨'), chalk.yellow('Successfully'));
    } else {
      console.log(
        chalk.yellow(
          'Not Found Image Module,  if you want to use style with image style, such as "background-image" you can use "beforeBundle: false" in plugin config',
        ),
      );
      if (mode === 'squoosh') {
        imagePool.close();
      }
    }

    spinner.text = chalk.yellow('Image conversion completed!');
    spinner.succeed();
  }

  /**
   *
   * @param bundle
   * 根据构建后transform已有chunk replace 代码结构 解析 css 与 js 模块
   */
  TransformChunksHook(bundle) {
    this.filterBundleFile(bundle);
    this.transformCodeHook(bundle);
  }

  setAssetsPath(path) {
    this.assetPath.push(path);
  }

  filterBundleFile(bundle) {
    Object.keys(bundle).forEach((key) => {
      const { outputPath } = this.config;
      // eslint-disable-next-line no-unused-expressions
      filterFile(resolve(outputPath!, key), extRE) && this.files.push(key);
    });
  }

  async transformCodeHook(bundle) {
    const allBundles = Object.values(bundle);
    const chunkBundle = allBundles.filter((item: any) => item.type === 'chunk');
    const assetBundle = allBundles.filter((item: any) => item.type === 'asset');
    const imageBundle = assetBundle.filter((item: any) =>
      item.fileName.match(extRE),
    );
    const imageFileBundle = imageBundle.map((item: any) => item.fileName);
    const needTransformAssetsBundle = assetBundle.filter((item: any) =>
      filterExtension(item.fileName, 'css'),
    );

    // transform css modules
    transformCode(
      this.config.options,
      needTransformAssetsBundle,
      imageFileBundle,
      'source',
    );
    // transform js modules
    transformCode(this.config.options, chunkBundle, imageFileBundle, 'code');
  }

  generateDefaultValue(imageModuleFlag, id) {
    if (imageModuleFlag) {
      const { path } = parseId(id);
      this.imageModulePath.push(path);
      const generateSrc = getBundleImageSrc(path, this.config.options);
      const base = basename(path, extname(path));
      const generatePath = join(
        `${this.config.base}${this.config.assetsDir}`,
        `${base}-${generateSrc}`,
      );
      return `export default ${devalue(generatePath)}`;
    }
  }

  // squoosh
  async generateSquooshBundle(imagePool, item) {
    const start = Date.now();
    const size = await fs.lstat(item);
    const oldSize = size.size;
    let newSize = oldSize;
    const ext = extname(item).slice(1) ?? '';
    const userRes = this.config.options.conversion.find((i) =>
      `${i.from}`.includes(ext),
    );
    // const itemConversion = this.config.isTurn && userRes?.from === ext;
    // TODO 图片接口转化
    const type =
      this.config.isTurn && userRes?.to
        ? encodeMapBack.get(userRes?.to)
        : encodeMapBack.get(ext);
    const image = imagePool.ingestImage(item);
    const defaultSquooshOptions = {};
    Object.keys(defaultOptions).forEach(
      (key) => (defaultSquooshOptions[key] = { ...this.mergeConfig[key] }),
    );
    const currentType = {
      [type!]: defaultSquooshOptions[type!],
    };
    await image.encode(currentType);
    const generateSrc = getBundleImageSrc(item, this.config.options);
    const baseDir = basename(item, extname(item));
    const { cacheDir, assetsDir } = this.config;
    const imageName = `${baseDir}-${generateSrc}`;
    // const cachedFilename = join(cacheDir, imageName);
    const encodedWith = await image.encodedWith[type!];
    newSize = encodedWith.size;
    // TODO add cache module
    // if (!(await exists(cachedFilename))) {
    // console.log(cachedFilename);
    // await fs.writeFile(cachedFilename, encodedWith.binary);
    // }
    const source = {
      fileName: join(assetsDir, imageName),
      name: imageName,
      // source: (await fs.readFile(cachedFilename)) as any,
      source: encodedWith.binary,
      isAsset: true,
      type: 'asset',
    };
    const { base, outDir } = this.config;
    compressSuccess(
      join(base, outDir, source.fileName),
      newSize,
      oldSize,
      start,
    );
    return source;
  }

  async generateSharpBundle(item) {
    const start = Date.now();
    const size = await fs.lstat(item);
    const oldSize = size.size;
    let newSize = oldSize;
    const sharpFileBuffer = await loadImage(item, this.config.options);
    const generateSrc = getBundleImageSrc(item, this.config.options);
    const base = basename(item, extname(item));
    const source = await writeImageFile(
      sharpFileBuffer,
      this.config,
      `${base}-${generateSrc}`,
    );
    newSize = sharpFileBuffer.length;
    const { outDir } = this.config;

    compressSuccess(
      join(this.config.base, outDir, source.fileName),
      newSize,
      oldSize,
      start,
    );
    return source;
  }

  generateBundleFile(bundler, result) {
    result.forEach((asset) => {
      bundler[asset.fileName] = asset;
    });
  }

  startGenerate() {
    console.log('\n');
    const info = chalk.gray('Process start with');
    const modeLog = chalk.magenta(`Mode ${this.config.options.mode}`);
    logger(pluginTitle('📦'), info, modeLog);
  }

  // close bundle
  async closeBundleHook() {
    if (!this.config.options.beforeBundle) {
      this.startGenerate();
      await this.spinnerHooks(this.closeBundleFn);
      this.transformHtmlModule();
    }
    return true;
  }

  async transformHtmlModule() {
    const htmlBundlePath = `${this.config.outDir}/index.html`;
    const html = await fs.readFile(resolve(process.cwd(), htmlBundlePath));
    const htmlBuffer = Buffer.from(html);
    const htmlCodeString = htmlBuffer.toString();
    let newFile: string = '';
    // if (htmlCodeString.includes('<img')) {
    this.config.options.conversion.forEach(async (item) => {
      const pattern = new RegExp(item.from, 'g');
      newFile =
        newFile.length > 0
          ? newFile.replace(pattern, item.to)
          : htmlCodeString.replace(pattern, item.to);
      await fs.writeFile(resolve(process.cwd(), htmlBundlePath), newFile);
    });
    // }
  }

  async spinnerHooks(fn) {
    if (!this.files.length) {
      return false;
    }
    let spinner;
    spinner = await loadWithRocketGradient('');
    await fn.call(this);
    logger(pluginTitle('✨'), chalk.yellow('Successfully'));
    spinner.text = chalk.yellow('Image conversion completed!');
    spinner.succeed();
  }

  async closeBundleFn() {
    const { isTurn, outputPath } = this.config;
    const { mode, cache } = this.config.options;
    const defaultSquooshOptions = {};
    Object.keys(defaultOptions).forEach(
      (key) => (defaultSquooshOptions[key] = { ...this.mergeConfig[key] }),
    );
    if (cache) {
      this.cache = new Cache({ outputPath });
    }
    const initOptions = {
      files: this.files,
      outputPath,
      inputPath: this.assetPath,
      options: this.config.options,
      isTurn,
      cache,
      chunks: this.chunks,
    };
    if (mode === 'squoosh' && SquooshUseFlag) {
      await initSquoosh({ ...initOptions, defaultSquooshOptions });
    } else if (mode === 'sharp') {
      await initSharp(initOptions);
    } else {
      throw new Error(
        '[unplugin-imagemin] Only squoosh or sharp can be selected for mode option',
      );
    }
  }
}
async function writeImageFile(buffer, options, imageName): Promise<any> {
  const { cacheDir, assetsDir } = options;

  const cachedFilename = join(cacheDir, imageName);
  if (!(await exists(cachedFilename))) {
  }
  return {
    fileName: join(assetsDir, imageName),
    name: imageName,
    source: buffer,
    isAsset: true,
    type: 'asset',
  };
}

async function convertToSharp(inputImg, options) {
  const currentType = options.conversion.find(
    (item) => item.from === extname(inputImg).slice(1),
  );
  let res;
  const ext = extname(inputImg).slice(1);
  if (currentType !== undefined) {
    const merge = {
      ...sharpOptions[ext],
      ...options.compress[currentType.to],
    };
    res = await sharp(inputImg)
      [sharpEncodeMap.get(currentType.to)](merge)
      .toBuffer();
  } else {
    const merge = {
      ...sharpOptions[ext],
      ...options.compress[ext],
    };
    res = await sharp(inputImg)[sharpEncodeMap.get(ext)](merge).toBuffer();
  }
  return res;
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
export async function loadImage(url: string, options: any) {
  const image = convertToSharp(url, options);
  return image;
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
export function transformCode(options, currentChunk, changeBundle, sourceCode) {
  currentChunk.forEach((item: any) => {
    options.conversion.forEach(
      (type: { from: string | RegExp; to: string }) => {
        changeBundle.forEach((file) => {
          if (file.includes(type.from)) {
            const name = transformFileName(file);
            item[sourceCode] = item[sourceCode].replace(
              `${name}${type.from}`,
              `${name}${encodeMap.get(type.to)}`,
            );
          }
        });
      },
    );
  });
}
