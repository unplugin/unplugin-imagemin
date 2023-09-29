import { resolveDefaultOptions } from './core/compressOptions';
import type { PluginOptions } from './core/types';
import { createUnplugin } from 'unplugin';
import Context from './core/context';
// squoosh navigator error
delete globalThis.navigator;
export default createUnplugin((options: PluginOptions = {}): any => {
  const ctx = new Context();
  // eslint-disable-next-line prefer-object-spread
  const assignOptions = Object.assign({}, resolveDefaultOptions, options);

  return {
    name: 'unplugin-imagemin',
    apply: 'build',
    enforce: assignOptions.beforeBundle ? 'pre' : 'post',
    async configResolved(config) {
      ctx.handleResolveOptionHook({ ...config, options: assignOptions });
    },
    async load(id) {
      if (assignOptions.beforeBundle) {
        const imageModule = ctx.loadBundleHook(id);
        if (imageModule) {
          return imageModule;
        }
      }
    },
    async generateBundle(_, bundler) {
      if (assignOptions.beforeBundle) {
        await ctx.generateBundleHook(bundler);
      } else {
        ctx.TransformChunksHook(bundler);
      }
    },
    closeBundle: {
      sequential: true,
      async handler() {
        await ctx.closeBundleHook();
      },
    },
  };
});
