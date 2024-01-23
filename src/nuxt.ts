import { addVitePlugin, addWebpackPlugin, defineNuxtModule } from '@nuxt/kit';
import type { ModuleDefinition } from '@nuxt/schema';

import { name, version } from '../package.json';
import type { PluginOptions } from './core/types';
import VitePlugin from './vite';
import WebpackPlugin from './webpack';

export default defineNuxtModule<PluginOptions>({
  meta: {
    name,
    version,
    configKey: 'autoProps',
    compatibility: {
      bridge: true,
    },
  },
  defaults: {},
  setup(options) {
    addVitePlugin(VitePlugin(options));
    addWebpackPlugin(WebpackPlugin(options));
  },
}) as ModuleDefinition<PluginOptions>;
