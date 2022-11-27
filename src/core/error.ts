export function error(string: string) {
  throw new Error(`[unplugin-imagemin]: ${string}`);
}
