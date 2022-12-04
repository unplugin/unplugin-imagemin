import { resolveDefaultOptions } from './core/compressOptions';
import type { PluginOptions } from './core/types';
import { createUnplugin } from 'unplugin';
import Context from './core/context';
const PLUGIN_NAME = 'unplugin:webpack';
// TODO 优化代码  imagemin sass 报错啊
export default createUnplugin((options: PluginOptions = {}): any => {
  const ctx = new Context();
  // eslint-disable-next-line prefer-object-spread
  const assignOptions = Object.assign({}, resolveDefaultOptions, options);
  return {
    name: 'unplugin-imagemin',
    apply: 'build',
    enforce: 'post',
    async configResolved(config) {
      ctx.handleMergeOptionHook({ ...config, options: assignOptions });
    },
    vite: {
      async load(id) {
        if (options.beforeBundle) {
          const imageModule = ctx.loadBundleHook(id);
          if (imageModule) {
            return imageModule;
          }
        }
      },
    },
    webpack(complier) {
      complier.hooks.done.tap(PLUGIN_NAME, () => {});
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
