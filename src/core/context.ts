// import fg from 'fast-glob'
// import type fs from 'fs'
// import { resolve, parse } from 'node:path'
// import transformer from './transform'
// export interface Options {

// }

// export type ResolvedOptions = Omit<
//   Required<Options>,
//   'resolvers' | 'extensions' | 'dirs'
// > & {
//   extensions: string[]
//   dirs: string[]
//   dts: string | false
//   root: string
// }
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

// const defaultOptions = {}
// export function resolveOptions(options: Options, root: string): ResolvedOptions {
//   const resolved = Object.assign({}, defaultOptions, options) as ResolvedOptions

//   // resolved.resolvers = normalizeResolvers(resolved.resolvers)
//   resolved.extensions = toArray(resolved.extensions)
//   return resolved
// }
