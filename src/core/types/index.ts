// eslint-disable-next-line @typescript-eslint/no-empty-interface
export interface Options {}

export interface CompressTypeOptions {
  mozjpeg?: any;
  jpeg?: any;
  webp?: any;
  avif?: any;
  jxl?: any;
  wp2?: any;
  oxipng?: any;
  png?: any;
  git?: any;
  svg?: any;
  tiff?: any;
}

interface ConversionItemType {
  from: string;
  to: string;
}
export interface PluginOptions {
  /**
   * @description Picture compilation and conversion
   * @default []
   */
  conversion?: ConversionItemType[];
  /**
   * @description Whether to turn on caching
   * @default true
   * TODO: Not realized
   */
  cache?: boolean;
  /**
   * @description Cache folder directory read
   * @default node_modules/unplugin-imagemin/cache
   *
   */
  cacheDir?: string;
  /**
   * @description Compilation attribute
   * @default CompressTypeOptions
   */
  compress?: CompressTypeOptions;
  /**
   * @description mode
   * @default squoosh
   * @description squoosh or sharp
   */
  mode?: 'squoosh' | 'sharp';
  /**
   * @description Whether to compress before packing
   * @default false
   */
  beforeBundle?: boolean;
}

export type ResolvedOptions = Omit<
  Required<CompressTypeOptions>,
  'resolvers' | 'extensions' | 'dirs'
> & {
  conversion: any[];
  cache: boolean;
  compress: any;
  root?: string;
  outputPath?: string;
  isTurn?: boolean;
};
