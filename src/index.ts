import { resolveDefaultOptions } from './core/types/index';
import { createUnplugin } from 'unplugin';
import Context from './core/context';

export default createUnplugin<any | undefined>((options = {}): any => {
  const ctx = new Context();
  const obj = Object.assign(options, resolveDefaultOptions);
  return {
    name: 'unplugin-imagemin',
    apply: 'build',
    enforce: 'pre',
    async configResolved(config) {
      ctx.handleMergeOptionHook({ ...config, options: obj });
    },
    async load(id) {
      if (options.beforeBundle) {
        const res = ctx.loadBundleHook(id);
        if (res) {
          return res;
        }
      }
    },
    async generateBundle(_, bundler) {
      if (options.beforeBundle) {
        await ctx.generateBundleHook(bundler);
      } else {
        ctx.TransformChunksHook(bundler);
      }
    },
    async closeBundle() {
      ctx.closeBundleHook();
    },
  };
});
