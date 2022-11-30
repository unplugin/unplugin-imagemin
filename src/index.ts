import { createUnplugin } from 'unplugin';
import Context from './core/context';
import { parseId } from './core/utils';

export default createUnplugin<any | undefined>((options = {}): any => {
  const ctx = new Context();
  if (!options.conversion) {
    options.conversion = [];
  }
  if (!options.mode) {
    options.mode = 'sharp';
  }
  return {
    name: 'unplugin-imagemin',
    apply: 'build',
    enforce: 'pre',
    async configResolved(config) {
      ctx.handleMergeOptionHook({ ...config, options });
    },
    async load(id) {
      const imageModuleFlag = ctx.filter(id);
      if (imageModuleFlag) {
        const { path } = parseId(id);
        ctx.setAssetsPath(path);
      }
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
