export interface CacheMetadata {
  mtimeMs: number;
  targetExtname: string;
}

export interface CachedAsset {
  fileName: string;
  name: string;
  source: Buffer | string;
  isAsset: boolean;
  type: 'asset';
  mtimeMs: number;
}

export interface ProcessedResult {
  fileName: string;
  name: string;
  source: Buffer | string;
  isAsset: boolean;
  type: 'asset';
}

export interface ResolvedOptions {
  base: string;
  command: 'build' | 'serve';
  root: string;
  cwd: string;
  outDir: string;
  assetsDir: string;
  options: {
    compress?: Record<string, unknown>;
    cache?: boolean;
    cacheLocation?: string;
    conversion?: Array<{ from: string | RegExp; to: string }>;
  };
  isBuild: boolean;
  cacheLocation: string;
  outputPath: string;
  isTurn: boolean;
  publicDir?: string;
} 
