import fs from 'node:fs';
import { dirname } from 'pathe';
import { error } from './error';

// export default class Cache {
//   private cacheLocation;

//   private cacheMap: Record<string, { mtimeMs: number; targetExtname: string }> =
//     {};

//   constructor(cacheLocation: string) {
//     this.cacheLocation = cacheLocation;
//     this.cacheMap = this.getCachedAsset();
//   }

//   existCacheLocation() {
//     return fs.existsSync(this.cacheLocation);
//   }

//   hasCachedAsset(
//     assetPath: string,
//     file: { mtimeMs: number; targetExtname: string },
//   ) {
//     const cachedFile = this.cacheMap[assetPath];
//     return (
//       cachedFile &&
//       cachedFile.mtimeMs === file.mtimeMs &&
//       cachedFile.targetExtname === file.targetExtname
//     );
//   }

//   getCachedAsset() {
//     if (!this.existCacheLocation()) {
//       fs.mkdirSync(dirname(this.cacheLocation), {
//         recursive: true,
//       });
//       return {};
//     }

//     const stat = fs.statSync(this.cacheLocation);
//     if (stat.isDirectory()) {
//       error(`Resolved cacheLocation '${this.cacheLocation}' is a directory`);
//       return;
//     }

//     const content = fs.readFileSync(this.cacheLocation, 'utf-8');

//     try {
//       return JSON.parse(content);
//     } catch (err) {
//       error(`'${this.cacheLocation}' isn't a valid JSON file`);
//     }
//   }

//   setCachedAsset(
//     assetPath: string,
//     file: { mtimeMs: number; targetExtname: string },
//   ) {
//     const cachedAsset = this.getCachedAsset();

//     this.cacheMap[assetPath] = file;

//     fs.writeFileSync(
//       this.cacheLocation,
//       JSON.stringify(
//         Object.assign(cachedAsset, {
//           [assetPath]: file,
//         }),
//       ),
//     );
//   }
// }

interface CacheEntry {
  mtimeMs: number;
  targetExtname: string;
  data: any;
}

export default class Cache {
  private cacheLocation: string;

  private cacheMap: Map<string, CacheEntry>;

  private isDirty = false;

  constructor(cacheLocation: string) {
    this.cacheLocation = cacheLocation;
    this.cacheMap = new Map();
    this.initCache();
  }

  private initCache(): void {
    try {
      if (!fs.existsSync(dirname(this.cacheLocation))) {
        fs.mkdirSync(dirname(this.cacheLocation), { recursive: true });
      }

      if (fs.existsSync(this.cacheLocation)) {
        const content = fs.readFileSync(this.cacheLocation, 'utf-8');
        const data = JSON.parse(content, this.reviver);
        this.cacheMap = new Map(Object.entries(data));
      }
    } catch (err) {
      console.error('Failed to initialize cache:', err);
      this.cacheMap = new Map();
    }
  }

  private reviver(key: string, value: any): any {
    if (value && value._type === 'Uint8Array' && Array.isArray(value.data)) {
      return new Uint8Array(value.data);
    }
    return value;
  }

  private replacer(key: string, value: any): any {
    if (value instanceof Uint8Array || Buffer.isBuffer(value)) {
      return {
        _type: 'Uint8Array',
        data: Array.from(value),
      };
    }
    return value;
  }

  public get<T>(key: string): T | null {
    const entry = this.cacheMap.get(key);
    return entry ? (entry.data as T) : null;
  }

  public hasCachedAsset(
    key: string,
    file: { mtimeMs: number; targetExtname: string },
  ): boolean {
    const entry = this.cacheMap.get(key);
    if (!entry) return false;

    return (
      entry.mtimeMs === file.mtimeMs &&
      entry.targetExtname === file.targetExtname
    );
  }

  public setCachedAsset<T>(
    key: string,
    file: { mtimeMs: number; targetExtname: string },
    data: T,
  ): void {
    const entry: CacheEntry = {
      mtimeMs: file.mtimeMs,
      targetExtname: file.targetExtname,
      data,
    };

    this.cacheMap.set(key, entry);
    this.isDirty = true;
    this.syncToFile();
  }

  private syncToFile(): void {
    if (!this.isDirty) return;

    try {
      const data = Object.fromEntries(this.cacheMap);
      fs.writeFileSync(
        this.cacheLocation,
        JSON.stringify(data, this.replacer, 2),
      );
      this.isDirty = false;
    } catch (err) {
      console.error('Failed to sync cache to file:', err);
    }
  }

  public delete(key: string): void {
    if (this.cacheMap.delete(key)) {
      this.isDirty = true;
      this.syncToFile();
    }
  }

  public clear(): void {
    this.cacheMap.clear();
    this.isDirty = true;
    this.syncToFile();
  }

  public getStats(): { size: number } {
    return {
      size: this.cacheMap.size,
    };
  }
}
