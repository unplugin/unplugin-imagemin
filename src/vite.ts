import unplugin from '.';
import type { Plugin } from 'vite';
// import type { Options } from './core/types';
export default unplugin.vite as (options?: any | undefined) => Plugin;
