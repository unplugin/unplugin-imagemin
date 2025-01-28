import fs from 'node:fs';
import { dirname } from 'pathe';
import type { CacheMetadata, CachedAsset } from './types';

interface CacheEntry<T> {
  mtimeMs: number;
  targetExtname: string;
  data: T;
}

interface JsonValue {
  _type?: 'Uint8Array';
  data?: number[];
  [key: string]: unknown;
}

export default class Cache {
  private cacheLocation: string;
  private cacheMap: Map<string, CacheEntry<CachedAsset>>;
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

  private reviver(_key: string, value: JsonValue): unknown {
    if (value && value._type === 'Uint8Array' && Array.isArray(value.data)) {
      return new Uint8Array(value.data);
    }
    return value;
  }

  private replacer(_key: string, value: unknown): JsonValue {
    if (value instanceof Uint8Array || Buffer.isBuffer(value)) {
      return {
        _type: 'Uint8Array',
        data: Array.from(value),
      };
    }
    return value as JsonValue;
  }

  public get<T extends CachedAsset>(key: string): T | null {
    const entry = this.cacheMap.get(key);
    return entry ? (entry.data as T) : null;
  }

  public hasCachedAsset(key: string, file: CacheMetadata): boolean {
    const entry = this.cacheMap.get(key);
    if (!entry) return false;

    return (
      entry.mtimeMs === file.mtimeMs &&
      entry.targetExtname === file.targetExtname
    );
  }

  public setCachedAsset(
    key: string,
    file: CacheMetadata,
    data: CachedAsset,
  ): void {
    const entry: CacheEntry<CachedAsset> = {
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
        JSON.stringify(data, this.replacer as unknown as (key: string, value: unknown) => unknown, 2),
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
