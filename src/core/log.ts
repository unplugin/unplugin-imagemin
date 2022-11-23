import * as kolorist from 'kolorist'
import { size } from './utils'

type colorTuple = string | number | any
function colorResult(args, color): void {
  console.log(kolorist[color](...args))
}
export const red = (args: colorTuple) => colorResult(args, 'red')
export const green = (res: colorTuple) => colorResult(res, 'green')
export const gray = (res: colorTuple) => colorResult(res, 'gray')
export const yellow = (res: colorTuple) => colorResult(res, 'yellow')
export const blue = (res: colorTuple) => colorResult(res, 'blue')
export const magenta = (res: colorTuple) => colorResult(res, 'blue')
export const black = (res: string | number) => colorResult(res, 'black')
export const cyan = (res: string | number) => colorResult(res, 'cyan')
export const bgGreen = (res: string | number) => colorResult(res, 'bgGreen')
export const bgRed = (res: string | number) => colorResult(res, 'bgRed')
export const bgYellow = (res: string | number) => colorResult(res, 'bgYellow')
export const bgGray = (res: string | number) => colorResult(res, 'bgGray')
export const bgBlue = (res: string | number) => colorResult(res, 'bgBlue')
export const bgMagenta = (res: string | number) => colorResult(res, 'bgMagenta')
export const bgCyan = (res: string | number) => colorResult(res, 'bgCyan')

export const complete = (name, dest, type, description) => {
  green(`\n ${description}`)
  cyan(`\n To get started with into "${name}.${type}"`)
}

export function compressSuccess(filePath, newSize, oldSize, start) {
  console.log(
    kolorist.blue(filePath),
    kolorist.yellow(size(oldSize).toString()),
    '/',
    kolorist.green(size(newSize).toString()),
    kolorist.magenta(`${Date.now() - start}ms`),
  );
}

export function pluginTitle(emoji) {
  return kolorist.blue(`${emoji} ${emoji} [unplugin-imagemin]`)
}
