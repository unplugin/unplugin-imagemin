import unplugin from '.';
import type { Plugin } from 'vite';
import type { Options } from './types';
export default unplugin.vite as (options?: Options | undefined) => Plugin;
