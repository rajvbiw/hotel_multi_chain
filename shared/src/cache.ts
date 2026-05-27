import { createClient, RedisClientType } from 'redis';

export class CacheService {
  private client: RedisClientType | null = null;
  private memoryCache = new Map<string, { value: string; expiresAt: number | null }>();
  private isFallback = true;

  constructor() {
    this.initialize();
  }

  private async initialize() {
    const redisUrl = process.env.REDIS_URL || 'redis://localhost:6379';
    try {
      console.log(`[CacheService] Connecting to Redis at ${redisUrl}...`);
      this.client = createClient({ url: redisUrl });
      
      this.client.on('error', (err) => {
        if (this.isFallback === false) {
          console.warn('[CacheService] Redis client error, switching to memory fallback:', err.message);
          this.isFallback = true;
        }
      });

      await this.client.connect();
      this.isFallback = false;
      console.log('[CacheService] Connected to Redis successfully.');
    } catch (err: any) {
      console.warn('[CacheService] Failed to connect to Redis. Using in-memory fallback. Error:', err.message);
      this.isFallback = true;
      this.client = null;
    }
  }

  public async get(key: string): Promise<string | null> {
    if (!this.isFallback && this.client) {
      try {
        return await this.client.get(key);
      } catch (err) {
        console.error('[CacheService] Redis get failed, using memory:', err);
      }
    }

    const item = this.memoryCache.get(key);
    if (!item) return null;

    if (item.expiresAt !== null && Date.now() > item.expiresAt) {
      this.memoryCache.delete(key);
      return null;
    }

    return item.value;
  }

  public async set(key: string, value: string, ttlSeconds?: number): Promise<void> {
    if (!this.isFallback && this.client) {
      try {
        if (ttlSeconds) {
          await this.client.set(key, value, { EX: ttlSeconds });
        } else {
          await this.client.set(key, value);
        }
        return;
      } catch (err) {
        console.error('[CacheService] Redis set failed, using memory:', err);
      }
    }

    const expiresAt = ttlSeconds ? Date.now() + ttlSeconds * 1000 : null;
    this.memoryCache.set(key, { value, expiresAt });
  }

  public async del(key: string): Promise<void> {
    if (!this.isFallback && this.client) {
      try {
        await this.client.del(key);
        return;
      } catch (err) {
        console.error('[CacheService] Redis del failed, using memory:', err);
      }
    }

    this.memoryCache.delete(key);
  }

  public async flush(): Promise<void> {
    if (!this.isFallback && this.client) {
      try {
        await this.client.flushAll();
        return;
      } catch (err) {
        console.error('[CacheService] Redis flushAll failed, using memory:', err);
      }
    }

    this.memoryCache.clear();
  }
}

export const cache = new CacheService();
export default cache;
