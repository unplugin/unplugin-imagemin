export interface Options {
  mozjpeg?: any;
  jpeg?: any;
  webp?: any;
  avif?: any;
  jxl?: any;
  wp2?: any;
  oxipng?: any;
  png?: any;
}

export type ResolvedOptions = Omit<
  Required<Options>,
  'resolvers' | 'extensions' | 'dirs'
> & {
  conversion: any[];
  cache: boolean;
  compress: any;
  root?: string;
  outputPath?: string;
  isTurn?: boolean;
};

export const resolveDefaultOptions = {
  mode: 'sharp',
  conversion: [],
  beforeBundle: false,
  cache: false,
  compress: {},
};
