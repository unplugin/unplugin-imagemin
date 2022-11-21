import { createUnplugin } from 'unplugin'
// import chalk from 'chalk'
// import Debug from 'debug'
// import type { Options } from './types'
// Options
import path from "node:path"
import * as init from '../rust-imagemin/pkg'
const extRE = /\.(png|jpeg|gif|jpg|bmp|svg)$/i
export default createUnplugin<any | undefined>(options => {
  let outputPath: string
  // let publicDir: string
  // let config: any
  console.log(options);
  return {
    name: 'unplugin-imagemin',
    apply: "build",
    enforce: 'post',
    transformInclude(id) {
      return id.endsWith('main.ts')
    },

    transform(code) {
      return code.replace('__UNPLUGIN__', `Hello Unplugin! ${options}`)
    },
    configResolved(resolvedConfig) {
      console.log(resolvedConfig.publicDir);
      console.log(resolvedConfig.build.outDir);
      outputPath = resolvedConfig.build.outDir;
    },
    async generateBundle(_, bundler) {
      const files: string[] = []
      Object.keys(bundler).forEach((key) => {
        filterFile(path.resolve(outputPath, key), extRE) && files.push(key)
      })
      // console.log(files, '拿到过滤文件信息');
      if (!files.length) {
        return
      }

      // 结构构造
      const handles = files.map((filePath: string) => {
        return bundler[filePath].source
      })

      console.log(handles);

    },
  }
})
function filterFile(
  file: string,
  filter: RegExp | ((file: string) => boolean),
) {
  if (filter) {
    const isRe = isRegExp(filter)
    const isFn = isFunction(filter)
    if (isRe) {
      return (filter as RegExp).test(file)
    }
    if (isFn) {
      return (filter as (file: any) => any)(file)
    }
  }
  return false
}
export const isFunction = (arg: unknown): arg is (...args: any[]) => any =>
  typeof arg === 'function'

export const isRegExp = (arg: unknown): arg is RegExp =>
  Object.prototype.toString.call(arg) === '[object RegExp]'
