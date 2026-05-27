"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.cache = exports.CacheService = void 0;
const redis_1 = require("redis");
class CacheService {
    client = null;
    memoryCache = new Map();
    isFallback = true;
    constructor() {
        this.initialize();
    }
    async initialize() {
        const redisUrl = process.env.REDIS_URL || 'redis://localhost:6379';
        try {
            console.log(`[CacheService] Connecting to Redis at ${redisUrl}...`);
            this.client = (0, redis_1.createClient)({ url: redisUrl });
            this.client.on('error', (err) => {
                if (this.isFallback === false) {
                    console.warn('[CacheService] Redis client error, switching to memory fallback:', err.message);
                    this.isFallback = true;
                }
            });
            await this.client.connect();
            this.isFallback = false;
            console.log('[CacheService] Connected to Redis successfully.');
        }
        catch (err) {
            console.warn('[CacheService] Failed to connect to Redis. Using in-memory fallback. Error:', err.message);
            this.isFallback = true;
            this.client = null;
        }
    }
    async get(key) {
        if (!this.isFallback && this.client) {
            try {
                return await this.client.get(key);
            }
            catch (err) {
                console.error('[CacheService] Redis get failed, using memory:', err);
            }
        }
        const item = this.memoryCache.get(key);
        if (!item)
            return null;
        if (item.expiresAt !== null && Date.now() > item.expiresAt) {
            this.memoryCache.delete(key);
            return null;
        }
        return item.value;
    }
    async set(key, value, ttlSeconds) {
        if (!this.isFallback && this.client) {
            try {
                if (ttlSeconds) {
                    await this.client.set(key, value, { EX: ttlSeconds });
                }
                else {
                    await this.client.set(key, value);
                }
                return;
            }
            catch (err) {
                console.error('[CacheService] Redis set failed, using memory:', err);
            }
        }
        const expiresAt = ttlSeconds ? Date.now() + ttlSeconds * 1000 : null;
        this.memoryCache.set(key, { value, expiresAt });
    }
    async del(key) {
        if (!this.isFallback && this.client) {
            try {
                await this.client.del(key);
                return;
            }
            catch (err) {
                console.error('[CacheService] Redis del failed, using memory:', err);
            }
        }
        this.memoryCache.delete(key);
    }
    async flush() {
        if (!this.isFallback && this.client) {
            try {
                await this.client.flushAll();
                return;
            }
            catch (err) {
                console.error('[CacheService] Redis flushAll failed, using memory:', err);
            }
        }
        this.memoryCache.clear();
    }
}
exports.CacheService = CacheService;
exports.cache = new CacheService();
exports.default = exports.cache;
//# sourceMappingURL=cache.js.map