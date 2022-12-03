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
  conversion?: ConversionItemType[];
  cache?: boolean;
  cacheDir?: string;
  compress?: CompressTypeOptions;
  mode?: 'squoosh' | 'sharp';
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
