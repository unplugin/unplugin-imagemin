import fg from 'fast-glob';
import type fs from 'fs';
import { resolve, parse } from 'node:path';
import transformer from './transform';
import { encodeMapBack } from './encodeMap';
import { type } from 'os';
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

  handlerMergeOption(defaultOptions) {
    this.mergeOption = resolveOptions(defaultOptions, this.options);
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
// export default class Context {
//   options: ResolvedOptions
//   root = process.cwd()
//   _cache = new Map<string, string>()
//   constructor(private rawOptions: Options = {}) {
//     this.options = resolveOptions(rawOptions, this.root)
//     // this.generateDeclaration = throttle(500, false, this.generateDeclaration.bind(this))
//   }
//   transform(code: string, id: string): any {
//     console.log('\n');
//     const { path, query } = parseId(id)
//     console.log(path, '这是path');
//     console.log(query, '这是query');
//     return transformer(this)(code, id, path, query)
//   }
// }

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
