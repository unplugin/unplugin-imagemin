import fs from 'node:fs';
import { dirname } from 'pathe';
import { error } from './error';

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

    const stat = fs.statSync(this.cacheDir);
    if (stat.isDirectory()) {
      error(`Resolved cacheDir '${this.cacheDir}' is a directory`);
      return;
    }

    const content = fs.readFileSync(this.cacheDir, 'utf-8');
    try {
      return JSON.parse(content);
    } catch (err) {
      error(`'${this.cacheDir}' isn't a valid JSON file`);
    }
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
