import { encodeMap, encodeMapBack } from './encodeMap';
import { createFilter } from '@rollup/pluginutils';
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
import { ImagePool } from '@squoosh/lib';
import { mkdir } from 'node:fs/promises';
import { promises as fs } from 'fs';
import { defaultOptions, sharpOptions } from './types';
import devalue from './devalue';
import chalk from 'chalk';
import { logger, pluginTitle } from './log';
import { loadWithRocketGradient } from './gradient';
import Cache from './cache';
import initSquoosh from './squoosh';
import initSharp from './sharp';

const extRE = /\.(png|jpeg|jpg|webp|wb2|avif)$/i;

export interface Options {
  compress: any;
}
export default class Context {
  config: ResolvedOptions | any;

  mergeConfig: any;

  mergeOption: any;

  imageModulePath: any = [];

  chunks: any;

  cache: any;

  files: any = [];

  assetPath: string[] = [];

  filter: any = createFilter(extRE, [
    /[\\/]node_modules[\\/]/,
    /[\\/]\.git[\\/]/,
  ]);

  setAssetsPath(path) {
    this.assetPath.push(path);
  }

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
    const cacheDir = join(root, 'node_modules', '.cache', 'unplugin-imagemin');
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

  TransformChunksHook(bundle) {
    Object.keys(bundle).forEach((key) => {
      const { outputPath } = this.config;
      // eslint-disable-next-line no-unused-expressions
      filterFile(resolve(outputPath!, key), extRE) && this.files.push(key);
    });
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

  // eslint-disable-next-line consistent-return
  loadBundleHook(id) {
    // filter image modules
    const imageModuleFlag = this.filter(id);
    if (imageModuleFlag) {
      const { path } = parseId(id);
      this.imageModulePath.push(path);
      const generateSrc = getBundleImageSrc(path, this.config.options);
      const base = basename(path, extname(path));
      const generatePath = join(
        `${this.config.base}${this.config.assetsDir}`,
        `${base}.${generateSrc}`,
      );
      return `export default ${devalue(generatePath)}`;
    }
    return '';
  }

  // 生成bundle
  async generateBundleHook(bundler) {
    this.chunks = bundler;
    if (!(await exists(this.config.cacheDir))) {
      await mkdir(this.config.cacheDir, { recursive: true });
    }
    const imagePool = new ImagePool();
    const info = chalk.gray('Process start with');
    const modeLog = chalk.magenta(`Mode ${this.config.options.mode}`);
    let spinner;
    spinner = await loadWithRocketGradient('');
    logger(pluginTitle('📦'), info, modeLog);
    const generateImageBundle = this.imageModulePath.map(async (item) => {
      if (this.config.options.mode === 'squoosh') {
        const ext = extname(item).slice(1) ?? '';
        const userRes = this.config.options.conversion.find((i) =>
          `${i.from}`.includes(ext),
        );
        const type = this.config.isTurn ? userRes?.to : encodeMapBack.get(ext);
        // const current: any = encodeMap.get(type);
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
        const base = basename(item, extname(item));
        const { cacheDir, assetsDir } = this.config;
        const imageName = `${base}.${generateSrc}`;
        const cachedFilename = join(cacheDir, imageName);
        const encodedWith = await image.encodedWith[type];
        // if (!(await exists(cachedFilename))) {
        await fs.writeFile(cachedFilename, encodedWith.binary);
        // }
        const source = {
          fileName: join(assetsDir, imageName),
          name: imageName,
          source: (await fs.readFile(cachedFilename)) as any,
          isAsset: true,
          type: 'asset',
        };
        return source;
      }
      if (this.config.options.mode === 'sharp') {
        const sharpFileBuffer = await loadImage(item, this.config.options);
        const generateSrc = getBundleImageSrc(item, this.config.options);
        const base = basename(item, extname(item));
        const source = await writeImageFile(
          sharpFileBuffer,
          this.config,
          `${base}.${generateSrc}`,
        );
        return source;
      }
    });
    // TODO prepare before bundle generate loading animation
    const result = await Promise.all(generateImageBundle);
    imagePool.close();
    result.forEach((asset) => {
      bundler[asset.fileName] = asset;
    });
    logger(pluginTitle('✨'), chalk.yellow('Successfully'));
    spinner.text = chalk.yellow('Image conversion completed!');
    spinner.succeed();
  }

  // close bundle
  async closeBundleHook() {
    if (!this.config.options.beforeBundle) {
      const { isTurn, outputPath } = this.config;
      const { mode, cache } = this.config.options;
      if (!this.files.length) {
        return false;
      }
      const info = chalk.gray('Process start with');
      const modeLog = chalk.magenta(`Mode ${mode}`);
      logger(pluginTitle('📦'), info, modeLog);
      // start spinner
      let spinner;
      if (!cache) {
        spinner = await loadWithRocketGradient('');
      }
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
      if (mode === 'squoosh') {
        await initSquoosh({ ...initOptions, defaultSquooshOptions });
      } else if (mode === 'sharp') {
        await initSharp(initOptions);
      } else {
        throw new Error(
          '[unplugin-imagemin] Only squoosh or sharp can be selected for mode option',
        );
      }
      logger(pluginTitle('✨'), chalk.yellow('Successfully'));
      if (!this.config.cacheDir || !cache) {
        spinner.text = chalk.yellow('Image conversion completed!');
        spinner.succeed();
      }
    }
    return true;
  }
}
async function writeImageFile(buffer, options, imageName): Promise<any> {
  const { cacheDir, assetsDir } = options;

  const cachedFilename = join(cacheDir, imageName);
  // if (!(await exists(cachedFilename))) {
  // await image.toFile(cachedFilename);
  // }
  return {
    fileName: join(assetsDir, imageName),
    name: imageName,
    // source: (await fs.readFile(cachedFilename)) as any,
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
    res = await sharp(inputImg)[currentType.to](merge).toBuffer();
  } else {
    const merge = {
      ...sharpOptions[ext],
      ...options.compress[ext],
    };
    res = await sharp(inputImg)[ext](merge).toBuffer();
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

export type ResolvedOptions = Omit<
  Required<Options>,
  'resolvers' | 'extensions' | 'dirs'
> & {
  conversion: any[];
  cache: boolean;
  compress: any;
  root?: string;
  outputPath?: string;
  isTurn?: boolean;
};

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
