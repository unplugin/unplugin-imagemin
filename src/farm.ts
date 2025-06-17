/**
 * This entry file is for esbuild plugin. Requires esbuild >= 0.15
 *
 * @module
 */

import unplugin from './index'

/**
 * Esbuild plugin
 *
 * @example
 * ```ts
 * import imagemin from 'unplugin-imagemin/farm'
 * 
 * build({ plugins: [imagemin()] })
```
 */
const farm = unplugin.farm as typeof unplugin.farm
export default farm
export { farm as 'module.exports' }
