import { resolveDefaultOptions } from './compressOptions';
import type { PluginOptions } from './types';
import { createUnplugin } from 'unplugin';
import Context, { extImageRE } from './context';
// squoosh navigator error
// delete globalThis.navigator;

export const plugin = createUnplugin((options?: PluginOptions): any => {
  const ctx = new Context();
  // eslint-disable-next-line prefer-object-spread
  const assignOptions = Object.assign({}, resolveDefaultOptions, options ?? {});

  return {
    name: 'unplugin-imagemin',
    apply: 'build',
    enforce: 'pre',
    async configResolved(config) {
      const resolveOptions = { ...config, options: assignOptions };
      ctx.handleResolveOptionHook(resolveOptions);
    },
    loadInclude(id) {
      // this way only load importer image not all like css
      // TODO support css file
      // TODO support publicDir
      return extImageRE.test(id)
    },
    async load(id) {
      return ctx.loadBundleHook(id);
    },
    async generateBundle(_, bundler) {
      await ctx.generateBundleHook(bundler);
    },
  };
});
