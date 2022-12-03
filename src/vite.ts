import unplugin from '.';
import type { Plugin } from 'vite';
import type { PluginOptions } from './core/types';
export default unplugin.vite as (options?: PluginOptions | undefined) => Plugin;
