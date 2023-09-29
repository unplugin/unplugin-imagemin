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
  conversion: string[];
  cache: boolean;
  compress: any;
  root?: string;
  outputPath?: string;
  isTurn?: boolean;
};

export interface ImageMinifyOptions {
  /**
   * @description Picture compilation and conversion
   */
  jpeg?: jpgDefaultOptions;
  mozjpeg?: jpgDefaultOptions;
  png?: pngDefaultOptions;
  webp?: webpDefaultOptions;
  avif?: avifDefaultOptions;
  jxl?: jxlDefaultOptions;
  wp2?: wp2DefaultOptions;
  oxipng?: oxipngDefaultOptions;
}

interface jpgDefaultOptions {
  // extension: /.(jpg|jpeg)$/,
  extension?: RegExp;
  quality?: number;
  baseline?: boolean;
  arithmetic?: boolean;
  progressive?: boolean;
  optimize_coding?: boolean;
  smoothing?: number;
  color_space?: number /* YCbCr */;
  quant_table?: number;
  trellis_multipass?: boolean;
  trellis_opt_zero?: boolean;
  trellis_opt_table?: boolean;
  trellis_loops?: number;
  auto_subsample?: boolean;
  chroma_subsample?: number;
  separate_chroma_quality?: boolean;
  chroma_quality?: number;
}

interface pngDefaultOptions {
  extension?: RegExp;
  quality?: number;
  target_size?: number;
  target_PSNR?: number;
  method?: number;
  sns_strength?: number;
  filter_strength?: number;
  filter_sharpness?: number;
  filter_type?: number;
  partitions?: number;
  segments?: number;
  pass?: number;
  show_compressed?: number;
  preprocessing?: number;
  autofilter?: number;
  partition_limit?: number;
  alpha_compression?: number;
  alpha_filtering?: number;
  alpha_quality?: number;
  lossless?: number;
  exact?: number;
  image_hint?: number;
  emulate_jpeg_size?: number;
  thread_level?: number;
  low_memory?: number;
  near_lossless?: number;
  use_delta_palette?: number;
  use_sharp_yuv?: number;
}

interface webpDefaultOptions {
  extension?: RegExp;
  quality?: number;
  target_size?: number;
  target_PSNR?: number;
  method?: number;
  sns_strength?: number;
  filter_strength?: number;
  filter_sharpness?: number;
  filter_type?: number;
  partitions?: number;
  segments?: number;
  pass?: number;
  show_compressed?: number;
  preprocessing?: number;
  autofilter?: number;
  partition_limit?: number;
  alpha_compression?: number;
  alpha_filtering?: number;
  alpha_quality?: number;
  lossless?: number;
  exact?: number;
  image_hint?: number;
  emulate_jpeg_size?: number;
  thread_level?: number;
  low_memory?: number;
  near_lossless?: number;
  use_delta_palette?: number;
  use_sharp_yuv?: number;
}

interface avifDefaultOptions {
  extension?: RegExp;
  cqLevel?: number;
  cqAlphaLevel?: number;
  denoiseLevel?: number;
  tileColsLog2?: number;
  tileRowsLog2?: number;
  speed?: number;
  subsample?: number;
  chromaDeltaQ?: boolean;
  sharpness?: number;
  tune?: number;
}

interface jxlDefaultOptions {
  extension?: RegExp;
  quality?: number;
  speed?: number;
  progressive?: boolean;
  epf?: number;
  effort?: number;
  lossyPalette?: boolean;
  decodingSpeedTier?: number;
  photonNoiseIso: number;
  lossyModular?: boolean;
}

interface wp2DefaultOptions {
  extension?: RegExp;
  quality?: number;
  alpha_quality?: number;
  effort?: number;
  pass?: number;
  sns?: number;
  uv_mode?: number /* UVMode.UVModeAuto */;
  csp_type?: number /* Csp.kYCoCg */;
  error_diffusion?: number;
  use_random_matrix?: boolean;
}

interface oxipngDefaultOptions {
  extension?: RegExp;
  level?: number;
}
