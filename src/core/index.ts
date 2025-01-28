import { resolveDefaultOptions } from './compressOptions';
import { createUnplugin } from 'unplugin';
import Context, { extImageRE } from './context';

import type { PluginOptions } from './types/index';

export const plugin = createUnplugin<PluginOptions | undefined, false>(
  (options = {}) => {
    const ctx = new Context();
    const assignOptions = { ...resolveDefaultOptions, ...options };

    return {
      name: 'unplugin-imagemin',
      apply: 'build',
      enforce: 'pre',
      async configResolved(config) {
        const resolveOptions = { ...config, options: assignOptions };
        ctx.handleResolveOptionHook(resolveOptions);
      },
      loadInclude(id) {
        return extImageRE.test(id);
      },
      async load(id) {
        return ctx.loadBundleHook(id);
      },
      async generateBundle(_, bundler) {
        await ctx.generateBundleHook(bundler);
      },
    };
  },
);
