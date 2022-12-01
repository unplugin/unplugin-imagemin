export default interface Options {
  mozjpeg?: any;
  webp?: any;
  avif?: any;
  jxl?: any;
  wp2?: any;
  oxipng?: any;
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

export const defaultOptions: Options = {
  mozjpeg: {
    extension: /.(jpg|jpeg)$/,
    quality: 75,
    baseline: false,
    arithmetic: false,
    progressive: true,
    optimize_coding: true,
    smoothing: 0,
    color_space: 3 /* YCbCr */,
    quant_table: 3,
    trellis_multipass: false,
    trellis_opt_zero: false,
    trellis_opt_table: false,
    trellis_loops: 1,
    auto_subsample: true,
    chroma_subsample: 2,
    separate_chroma_quality: false,
    chroma_quality: 75,
  },
  webp: {
    extension: /.webp$/,
    quality: 75,
    target_size: 0,
    target_PSNR: 0,
    method: 4,
    sns_strength: 50,
    filter_strength: 60,
    filter_sharpness: 0,
    filter_type: 1,
    partitions: 0,
    segments: 4,
    pass: 1,
    show_compressed: 0,
    preprocessing: 0,
    autofilter: 0,
    partition_limit: 0,
    alpha_compression: 1,
    alpha_filtering: 1,
    alpha_quality: 100,
    lossless: 0,
    exact: 0,
    image_hint: 0,
    emulate_jpeg_size: 0,
    thread_level: 0,
    low_memory: 0,
    near_lossless: 100,
    use_delta_palette: 0,
    use_sharp_yuv: 0,
  },
  avif: {
    extension: /.avif$/,
    cqLevel: 33,
    cqAlphaLevel: -1,
    denoiseLevel: 0,
    tileColsLog2: 0,
    tileRowsLog2: 0,
    speed: 6,
    subsample: 1,
    chromaDeltaQ: false,
    sharpness: 0,
    tune: 0 /* AVIFTune.auto */,
  },
  jxl: {
    extension: /.jxl$/,
    effort: 1,
    quality: 75,
    progressive: false,
    epf: -1,
    lossyPalette: false,
    decodingSpeedTier: 0,
    photonNoiseIso: 0,
    lossyModular: false,
  },
  wp2: {
    extension: /.wp2$/,
    quality: 75,
    alpha_quality: 75,
    effort: 5,
    pass: 1,
    sns: 50,
    uv_mode: 0 /* UVMode.UVModeAuto */,
    csp_type: 0 /* Csp.kYCoCg */,
    error_diffusion: 0,
    use_random_matrix: false,
  },
  oxipng: {
    extension: /.png$/,
    level: 2,
  },
};

export const sharpOptions: any = {
  jpeg: {
    //     quality (Number) 图片质量，整数1-100(可选，默认80)
    // progressive (Boolean) 使用渐进式(交错)扫描(可选，默认为false)
    // chromaSubsampling (String) 设置为“4:4:4”，以防止质量<= 90时色度子采样(可选，默认为“4:2:0”)
    // trellisQuantisation (Boolean) 应用网格量化，需要mozjpeg(可选，默认为false)
    // overshootDeringing (Boolean) 应用超调脱靶，需要mozjpeg(可选，默认为false)
    // optimiseScans (Boolean) 优化渐进式扫描，强制渐进式扫描，要求mozjpeg(可选，默认为false)
    // optimizeScans (Boolean) optimisescan的替代拼写(可选，默认为false)
    // optimiseCoding (Boolean) 优化Huffman编码表(可选，默认为true)
    // optimizeCoding (Boolean) optimiseCoding的替代拼写(可选，默认为true)
    // quantisationTable (Number) 要使用量子化表，整数0-8，需要mozjpeg(可选，默认为0)
    // quantizationTable(Number) quantisationTable的替代边写，整数0-8，需要mozjpeg(可选，默认为0)
    // force (Boolean) 强制JPEG输出，否则尝试使用输入格式(可选，默认为true)
    quality: 75,
    progressive: false,
    chromaSubsampling: '4:4:4',
    trellisQuantisation: false,
    overshootDeringing: false,
    optimiseScans: false,
    optimizeScans: false,
    optimiseCoding: true,
    optimizeCoding: true,
    quantisationTable: 0,
    quantizationTable: 0,
    force: true,
  },
  // progressive (Boolean) 使用渐进式(交错)扫描(可选，默认为false)
  // compressionLevel (Number) zlib压缩级别，0-9(可选，默认9)
  // adaptiveFiltering (Boolean) 使用自适应行筛选(可选，默认为false)
  // force (Boolean) 强制PNG输出，否则尝试使用输入格式(可选，默认为true)
  png: {
    progressive: false,
    compressionLevel: 6,
    adaptiveFiltering: false,
    force: true,
    palette: true,
    quality: 75,
    effort: 7,
    bitdepth: 8,
    dither: 1,
  },
  // options (Object)
  // quality (Number) 质量，整数1-100(可选，默认80)
  // alphaQuality (Number) alpha层的质量，整数0-100(可选，默认100)
  // lossless (Boolean) 使用无损压缩模式(可选，默认为false)
  // nearLossless (Boolean) 使用接近无损压缩模式(可选，默认为false)
  // force (Boolean) 强制WebP输出，否则尝试使用输入格式(可选，默认为true)
  webp: {
    quality: 75,
    alphaQuality: 100,
    lossless: false,
    nearLossless: false,
    smartSubsample: false,
    effort: 4,
  },
  // quality (Number) 质量，整数1-100(可选，默认80)
  // force (Boolean) 强制TIFF输出，否则尝试使用输入格式(可选，默认为true)
  // compression (Boolean) 压缩选项:lzw, deflate, jpeg, ccittfax4(可选，默认'jpeg')
  // predictor (String) 压缩预测器选项:无、水平、浮动(可选、默认“水平”)
  // xres (Number) 水平分辨率(像素/mm)(可选，默认1.0)
  // yres (Number) 垂直分辨率(像素/mm)(可选，默认1.0)
  // squash (Boolean) 将8位图像压缩到1位(可选，默认为false)
  tiff: {
    quality: 80,
    compression: 'jpeg',
    predictor: 'horizontal',
    pyramid: false,
    bitdepth: 8,
    tile: false,
    tileHeight: 256,
    tileWidth: 256,
    xres: 1,
    yres: 1,
    resolutionUnit: 'inch',
  },
};

export const resolveDefaultOptions = {
  mode: 'sharp',
  conversion: [],
  beforeBundle: false,
  cache: false,
  compress: {},
};
