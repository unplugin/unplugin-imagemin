import { resolveDefaultOptions } from './compressOptions';
import type { PluginOptions } from './types';
import { createUnplugin } from 'unplugin';
import Context from './context';
// squoosh navigator error
// delete globalThis.navigator;

export const plugin = createUnplugin((options?: PluginOptions): any => {
  const ctx = new Context();
  // eslint-disable-next-line prefer-object-spread
  const assignOptions = Object.assign({}, resolveDefaultOptions, options ?? {});

  return {
    name: 'unplugin-imagemin',
    apply: 'build',
    enforce: assignOptions.beforeBundle ? 'pre' : 'post',
    async configResolved(config) {
      const resolveOptions = { ...config, options: assignOptions };
      ctx.handleResolveOptionHook(resolveOptions);
    },
    loadInclude(id) {
      console.log(id);
      return false;
    },
    async load(id) {
      console.log(id);

      const imageModule = ctx.loadBundleHook(id);
      if (imageModule) {
        return imageModule;
      }
    },
    // async generateBundle(_, bundler) {
    // if (assignOptions.beforeBundle) {
    // await ctx.generateBundleHook(bundler);
    // } else {
    // ctx.TransformChunksHook(bundler);
    // }
    // },
    // closeBundle: {
    //   sequential: true,
    //   async handler() {
    //     await ctx.closeBundleHook();
    //   },
    // },
  };
});
