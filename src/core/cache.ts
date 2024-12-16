import fs from 'node:fs';
import { dirname } from 'pathe';
import { error } from './error';

export default class Cache {
  private cacheLocation;

  private cacheMap: Record<string, { mtimeMs: number; targetExtname: string }> =
    {};

  constructor(cacheLocation: string) {
    this.cacheLocation = cacheLocation;
    this.cacheMap = this.getCachedAsset();
  }

  existCacheLocation() {
    return fs.existsSync(this.cacheLocation);
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
    if (!this.existCacheLocation()) {
      fs.mkdirSync(dirname(this.cacheLocation), {
        recursive: true,
      });
      return {};
    }

    const stat = fs.statSync(this.cacheLocation);
    if (stat.isDirectory()) {
      error(`Resolved cacheLocation '${this.cacheLocation}' is a directory`);
      return;
    }

    const content = fs.readFileSync(this.cacheLocation, 'utf-8');
    try {
      return JSON.parse(content);
    } catch (err) {
      error(`'${this.cacheLocation}' isn't a valid JSON file`);
    }
  }

  setCachedAsset(
    assetPath: string,
    file: { mtimeMs: number; targetExtname: string },
  ) {
    const cachedAsset = this.getCachedAsset();

    this.cacheMap[assetPath] = file;

    fs.writeFileSync(
      this.cacheLocation,
      JSON.stringify(
        Object.assign(cachedAsset, {
          [assetPath]: file,
        }),
      ),
    );
  }
}
