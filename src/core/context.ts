import { encodeMap, encodeMapBack } from './encodeMap';
import { createFilter } from '@rollup/pluginutils';
import { lastSymbol, parseId } from './utils';
import { createHash } from 'crypto';
import { basename, extname, join, resolve } from 'pathe';
import sharp from 'sharp';
import { ImagePool } from '@squoosh/lib';
import { mkdir } from 'node:fs/promises';
import { promises as fs, constants } from 'fs';
import { defaultOptions } from './types';
const extRE = /\.(png|jpeg|jpg|webp|wb2|avif)$/i;

export interface Options {
  compress: any;
}
export default class Context {
  options: ResolvedOptions;

  mergeOption: any;

  arr: any = [];

  filter: any = createFilter(extRE, [
    /[\\/]node_modules[\\/]/,
    /[\\/]\.git[\\/]/,
  ]);

  root = process.cwd();

  constructor(config) {
    this.options = config;
  }

  handleMergeOption(defaultOptions) {
    this.mergeOption = resolveOptions(defaultOptions, this.options);
  }

  handleTransform(bundle) {
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
      this.options,
      needTransformAssetsBundle,
      imageFileBundle,
      'source',
    );
    // transform js modules
    transformCode(this.options, chunkBundle, imageFileBundle, 'code');
  }

  loadBundle(id) {
    const imageModuleFlag = this.filter(id);
    if (imageModuleFlag) {
      const { path } = parseId(id);
      this.arr.push(path);
      const generateSrc = getBundleImageSrc(path);
      const base = basename(path, extname(path));
      const generatePath = `${this.mergeOption.base}${this.mergeOption.build.assetsDir}/${base}.${generateSrc}`;
      return generatePath;
    }
  }

  // 生成bundle
  async generateBundle() {
    if (!(await exists(this.mergeOption.cacheDir))) {
      await mkdir(this.mergeOption.cacheDir, { recursive: true });
    }
    const imagePool = new ImagePool();
    const res = this.arr.map(async (item) => {
      if ((this, this.mergeOption.mode === 'squoosh')) {
        const ext = extname(item).slice(1) ?? '';
        const userRes = this.mergeOption.conversion.find((i) =>
          `${i.from}`.includes(ext),
        );
        const type = this.mergeOption.isTurn
          ? userRes?.to
          : encodeMapBack.get(ext);
        const current: any = encodeMap.get(type);
        const image = imagePool.ingestImage(item);
        const defaultSquooshOptions = {};
        Object.keys(defaultOptions).forEach(
          (key) => (defaultSquooshOptions[key] = { ...this.mergeOption[key] }),
        );
        const currentType = {
          [type!]: defaultSquooshOptions[type!],
        };
        await image.encode(currentType);
        const generateSrc = getBundleImageSrc(item);
        const base = basename(item, extname(item));
        const { cacheDir, build } = this.mergeOption;
        const { assetsDir } = build;
        const imagename = `${base}.${generateSrc}`;
        const cachedFilename = join(cacheDir, imagename);
        const encodedWith = await image.encodedWith[type];
        // if (!(await exists(cachedFilename))) {
        await fs.writeFile(cachedFilename, encodedWith.binary);
        // }
        const source = {
          fileName: join(assetsDir, imagename),
          name: imagename,
          source: (await fs.readFile(cachedFilename)) as any,
          isAsset: true,
          type: 'asset',
        };
        return source;
      }
      if (this.mergeOption.mode === 'sharp') {
        const sharpFile = loadImage(item);
        const generateSrc = getBundleImageSrc(item);
        const base = basename(item, extname(item));
        // eslint-disable-next-line no-return-await
        // eslint-disable-next-line no-return-await
        const source = await writeImageFile(
          sharpFile,
          this.mergeOption,
          `${base}.${generateSrc}`,
        );
        return source;
      }
    });
    const result = await Promise.all(res);
    imagePool.close();
    // eslint-disable-next-line no-return-await
    return result;
  }
}
async function writeImageFile(image: any, options, imagename): Promise<any> {
  const { cacheDir, build } = options;
  const { assetsDir } = build;

  const cachedFilename = join(cacheDir, imagename);
  if (!(await exists(cachedFilename))) {
    await image.toFile(cachedFilename);
  }
  return {
    fileName: join(assetsDir, imagename),
    name: imagename,
    source: (await fs.readFile(cachedFilename)) as any,
    isAsset: true,
    type: 'asset',
  };
}
function mkdirSync(mkdirPath: string): void {
  fs.mkdir(mkdirPath, { recursive: true });
}
export async function exists(path: string) {
  // eslint-disable-next-line no-return-await
  return await fs.access(path, constants.F_OK).then(
    () => true,
    () => false,
  );
}
function getBundleImageSrc(filename: string) {
  const id = generateImageID(filename);
  return id;
}
export function loadImage(url: string) {
  return sharp(decodeURIComponent(parseURL(url).pathname));
}
function parseURL(rawURL: string) {
  return new URL(rawURL.replace(/#/g, '%23'), 'file://');
}
export function generateImageID(filename: string, format: string = 'jpeg') {
  return `${createHash('sha256')
    .update(filename)
    .digest('hex')
    .slice(0, 8)}.${format}`;
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
  defaultOptions: any,
  options: Options,
): ResolvedOptions {
  const transformType = transformEncodeType(options?.compress);
  const keys = Object.keys(transformType);
  const res = keys.map(
    (item) =>
      ({
        ...defaultOptions[item],
        ...transformType[item],
      } as ResolvedOptions),
  );
  const obj = {};
  keys.forEach((item, index) => {
    obj[item] = res[index];
  });
  return { ...defaultOptions, ...obj } as ResolvedOptions;
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
export function transformFileName(file) {
  return file.substring(0, file.lastIndexOf('.') + 1);
}
// 判断后缀名
export function filterExtension(name: string, ext: string): boolean {
  const reg = new RegExp(`.${ext}`);
  return Boolean(name.match(reg));
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
