import { resolveDefaultOptions } from './core/compressOptions';
import type { PluginOptions } from './core/types';
import { createUnplugin } from 'unplugin';
import Context from './core/context';

// TODO conversion 一套接口问题
// TODO 提取出结构赋值
export default createUnplugin<PluginOptions | undefined>(
  (options = {}): any => {
    const ctx = new Context();
    // eslint-disable-next-line prefer-object-spread
    const assignOptions = Object.assign({}, resolveDefaultOptions, options);
    return {
      name: 'unplugin-imagemin',
      apply: 'build',
      enforce: 'pre',
      async configResolved(config) {
        ctx.handleMergeOptionHook({ ...config, options: assignOptions });
      },
      async load(id) {
        if (options.beforeBundle) {
          const imageModule = ctx.loadBundleHook(id);
          if (imageModule) {
            return imageModule;
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
  },
);
