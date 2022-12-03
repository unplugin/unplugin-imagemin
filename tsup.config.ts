// import { defineConfig } from 'tsup';

// export default defineConfig({
//   entry: ['./src/*.ts'],
//   format: ['esm', 'cjs'],
//   target: 'node14',
//   clean: true,
//   dts: true,
//   splitting: true,
//   shims: true,
// });
import type { Options } from 'tsup';

export const tsup: Options = {
  entry: ['src/*.ts'],
  format: ['cjs', 'esm'],
  // dts: true,
  splitting: true,
  clean: true,
  shims: false,
};
