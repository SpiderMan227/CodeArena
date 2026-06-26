import { redisClient } from '../../utils/redis';

export interface ICache {
  get(key: string): Promise<string | null>;
  set(key: string, value: string, ttlSeconds: number): Promise<void>;
}

class InMemoryCache implements ICache {
  private cache = new Map<string, { value: string; expiresAt: number }>();

  public async get(key: string): Promise<string | null> {
    const entry = this.cache.get(key);
    if (!entry) return null;
    if (Date.now() > entry.expiresAt) {
      this.cache.delete(key);
      return null;
    }
    return entry.value;
  }

  public async set(key: string, value: string, ttlSeconds: number): Promise<void> {
    this.cache.set(key, {
      value,
      expiresAt: Date.now() + ttlSeconds * 1000,
    });
  }
}

class RedisCache implements ICache {
  public async get(key: string): Promise<string | null> {
    try {
      // Check if redisClient is open/ready
      if (redisClient.isOpen) {
        return await redisClient.get(key);
      }
    } catch (err) {
      console.error('[Redis Cache Get Error]:', err);
    }
    return null;
  }

  public async set(key: string, value: string, ttlSeconds: number): Promise<void> {
    try {
      if (redisClient.isOpen) {
        await redisClient.set(key, value, { EX: ttlSeconds });
      }
    } catch (err) {
      console.error('[Redis Cache Set Error]:', err);
    }
  }
}

export class CacheService implements ICache {
  private redisCache = new RedisCache();
  private inMemoryCache = new InMemoryCache();

  public async get(key: string): Promise<string | null> {
    // 1. Try Redis Cache
    const value = await this.redisCache.get(key);
    if (value !== null) {
      return value;
    }
    // 2. Fall back to InMemory Cache
    return await this.inMemoryCache.get(key);
  }

  public async set(key: string, value: string, ttlSeconds: number): Promise<void> {
    // Set in both cache providers to keep in sync and have fallback ready
    await this.inMemoryCache.set(key, value, ttlSeconds);
    await this.redisCache.set(key, value, ttlSeconds);
  }
}
