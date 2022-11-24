import fg from 'fast-glob';
import type fs from 'fs';
import { resolve, parse } from 'node:path';
import transformer from './transform';
import { encodeMap, encodeMapBack } from './encodeMap';
import { type } from 'os';
const extRE = /\.(png|jpeg|jpg|webp|wb2|avif)$/i;

export interface Options {
  compress: any;
}
// import { defaultOptions } from './types';
export default class Context {
  options: ResolvedOptions;

  mergeOption: any;

  root = process.cwd();

  constructor(private rawOptions) {
    this.options = rawOptions;
  }

  handleMergeOption(defaultOptions) {
    this.mergeOption = resolveOptions(defaultOptions, this.options);
  }

  // eslint-disable-next-line class-methods-use-this
  handleTransform(bundle) {
    const allBundles = Object.values(bundle);
    const chunkBundle = allBundles.filter((item: any) => item.type === 'chunk');
    const assetBundle = allBundles.filter((item: any) => item.type === 'asset');
    const imageBundle = assetBundle.filter((item: any) =>
      item.fileName.match(extRE),
    );
    const imageFileBundle = imageBundle.map((item: any) => item.fileName);
    // console.log(imageFileBundle);
    const imageFiles = imageFileBundle.map((item: any) =>
      item.substring(0, item.lastIndexOf('.') + 1),
    );
    function transformFileName (file) {
      return file.substring(0, file.lastIndexOf('.') + 1),
    }

    chunkBundle.forEach((item: any) => {
      this.options.conversion.forEach(
        // eslint-disable-next-line @typescript-eslint/no-shadow
        (type: { from: string | RegExp; to: string }) => {
          // imageFiles.forEach((file) => {
          //   item.code = item.code.replace(
          //     `${file}${type.from}`,
          //     `${file}${encodeMap.get(type.to)}`,
          //   );
          // });
          imageFileBundle.forEach((file) => {
            if (file.includes(type.from)) {
              const name = transformFileName(file)
              item.code = item.code.replace(
                `${name}${type.from}`,
                `${name}${encodeMap.get(type.to)}`,
              );
            }
          });
        },
      );
    });
  }
}
export type ResolvedOptions = Omit<
  Required<Options>,
  'resolvers' | 'extensions' | 'dirs'
> & {
  conversion: any[];
  cache: boolean;
  compress: any;
  root?: string;
};

export function resolveOptions(
  defaultOptions: any,
  options: Options,
): ResolvedOptions {
  const transformType = transformEncodeType(options.compress);
  const keys = Object.keys(transformType);
  const res = keys.map(
    (item) =>
      // eslint-disable-next-line prefer-object-spread
      Object.assign(
        {},
        defaultOptions[item],
        transformType[item],
      ) as ResolvedOptions,
  );
  const obj = {};
  keys.forEach((item, index) => {
    obj[item] = res[index];
  });
  // eslint-disable-next-line prefer-object-spread
  const resolved = Object.assign({}, defaultOptions, obj) as ResolvedOptions;
  return resolved;
}

export function transformEncodeType(options) {
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
