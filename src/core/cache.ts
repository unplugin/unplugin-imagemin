import fs from 'node:fs';
import { dirname } from 'pathe';

export default class Cache {
  private cacheDir;

  private cacheMap: Record<string, { mtimeMs: number; targetExtname: string }> =
    {};

  constructor(cacheDir: string) {
    this.cacheDir = cacheDir;
    this.cacheMap = this.getCachedAsset();
  }

  existCacheDir() {
    return fs.existsSync(this.cacheDir);
  }

  hasCachedAsset(
    assetPath: string,
    file: { mtimeMs: number; targetExtname: string },
  ) {
    const cachedFile = this.cacheMap[assetPath];
    return (
      cachedFile &&
      cachedFile.mtimeMs === file.mtimeMs &&
      cachedFile.targetExtname === file.targetExtname
    );
  }

  getCachedAsset() {
    if (!this.existCacheDir()) {
      fs.mkdirSync(dirname(this.cacheDir), {
        recursive: true,
      });
      return {};
    }

    return JSON.parse(fs.readFileSync(this.cacheDir, 'utf-8'));
  }

  setCachedAsset(
    assetPath: string,
    file: { mtimeMs: number; targetExtname: string },
  ) {
    const cachedAsset = this.getCachedAsset();

    this.cacheMap[assetPath] = file;

    fs.writeFileSync(
      this.cacheDir,
      JSON.stringify(
        Object.assign(cachedAsset, {
          [assetPath]: file,
        }),
      ),
    );
  }
}
