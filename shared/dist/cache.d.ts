export declare class CacheService {
    private client;
    private memoryCache;
    private isFallback;
    constructor();
    private initialize;
    get(key: string): Promise<string | null>;
    set(key: string, value: string, ttlSeconds?: number): Promise<void>;
    del(key: string): Promise<void>;
    flush(): Promise<void>;
}
export declare const cache: CacheService;
export default cache;
