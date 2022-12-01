import { partial } from 'filesize';
import { createHash } from 'node:crypto';
import { promises as fs, constants } from 'fs';
import { resolve } from 'pathe';

export const size = partial({ base: 2, standard: 'jedec' });
const extRE = /(png|jpeg|jpg|webp|wb2|avif)$/i;

export function camelCase(str: string): string {
  return str.replace(/[-_](\w)/g, (_, c) => (c ? c.toUpperCase() : ''));
}
export function pascalCase(str: string): string {
  const camel = camelCase(str);
  return camel[0].toUpperCase() + camel.slice(1);
}

export function normalizeResolvers(resolvers: any) {
  return toArray(resolvers).flat();
}

export function toArray<T>(array?: any): Array<T> {
  // eslint-disable-next-line no-param-reassign
  array = array ?? [];
  return Array.isArray(array) ? array : [array];
}

export function parseId(id: string) {
  const index = id.indexOf('?');
  if (index < 0) {
    return { path: id, query: {} };
  }
  const query = Object.fromEntries(new URLSearchParams(id.slice(index)) as any);
  return {
    path: id.slice(0, index),
    query,
  };
}
export function isEmpty(value: any): boolean {
  return (
    !value ||
    value === null ||
    value === undefined ||
    (Array.isArray(value) && Object.keys(value).length <= 0)
  );
}

export const isFunction = (arg: unknown): arg is (...args: any[]) => any =>
  typeof arg === 'function';

export const isRegExp = (arg: unknown): arg is RegExp =>
  Object.prototype.toString.call(arg) === '[object RegExp]';

export function filterFile(
  file: string,
  filter: RegExp | ((file: string) => boolean),
) {
  if (filter) {
    const isRe = isRegExp(filter);
    const isFn = isFunction(filter);
    if (isRe) {
      return (filter as RegExp).test(file);
    }
    if (isFn) {
      return (filter as (file: any) => any)(file);
    }
  }
  return false;
}

export function getUserCompressType(type = 'webp') {
  return type;
}

export function isTurnImageType(options) {
  const hasConversion = options;
  // eslint-disable-next-line no-implicit-coercion
  const hasType = !!options?.length;
  const isReallyType = options?.every(
    (item) => item.from.match(extRE) && item.to.match(extRE),
  );
  // console.log(isReallyType);

  return Boolean(hasConversion && hasType && isReallyType);
}

// 最后一个符号后的内容
export function lastSymbol(string: string, symbol: string) {
  const arr = string.split(symbol);
  return arr[arr.length - 1];
}

export function mkdirSync(mkdirPath: string): void {
  fs.mkdir(mkdirPath, { recursive: true });
}
export async function exists(path: string) {
  // eslint-disable-next-line no-return-await
  return await fs.access(path, constants.F_OK).then(
    () => true,
    () => false,
  );
}

export function parseURL(rawURL: string) {
  return new URL(rawURL.replace(/#/g, '%23'), 'file://');
}

export function generateImageID(filename: string, format: string = 'jpeg') {
  return `${createHash('sha256')
    .update(filename)
    .digest('hex')
    .slice(0, 8)}.${format}`;
}

export function transformFileName(file) {
  return file.substring(0, file.lastIndexOf('.') + 1);
}
// 判断后缀名
export function filterExtension(name: string, ext: string): boolean {
  const reg = new RegExp(`.${ext}`);
  return Boolean(name.match(reg));
}
