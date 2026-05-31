"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.eventBus = void 0;
const events_1 = require("events");
const redis_1 = require("redis");
class EventBusService {
    localEmitter = new events_1.EventEmitter();
    pubClient = null;
    subClient = null;
    isFallback = true;
    activeSubscriptions = new Set();
    constructor() {
        this.localEmitter.setMaxListeners(100);
        this.initializeRedis();
    }
    async initializeRedis() {
        const redisUrl = process.env.REDIS_URL || 'redis://localhost:6379';
        try {
            console.log(`[EventBus] Connecting to Redis Pub/Sub at ${redisUrl}...`);
            this.pubClient = (0, redis_1.createClient)({ url: redisUrl });
            this.subClient = this.pubClient.duplicate();
            const handleError = (err) => {
                if (!this.isFallback) {
                    console.warn('[EventBus] Redis Pub/Sub client error, switching to local fallback:', err.message);
                    this.isFallback = true;
                }
            };
            this.pubClient.on('error', handleError);
            this.subClient.on('error', handleError);
            await Promise.all([this.pubClient.connect(), this.subClient.connect()]);
            this.isFallback = false;
            console.log('[EventBus] Connected to Redis Pub/Sub successfully.');
            // Re-subscribe to all active channels if any were registered before connection
            for (const channel of this.activeSubscriptions) {
                await this.setupRedisSubscription(channel);
            }
        }
        catch (err) {
            console.warn('[EventBus] Failed to connect to Redis Pub/Sub. Using local in-memory fallback. Error:', err.message);
            this.isFallback = true;
            this.pubClient = null;
            this.subClient = null;
        }
    }
    async setupRedisSubscription(channel) {
        if (this.subClient) {
            try {
                await this.subClient.subscribe(channel, (message) => {
                    try {
                        console.log(`[EventBus:RedisSub] Received broadcast for "${channel}"`);
                        const payload = JSON.parse(message);
                        this.localEmitter.emit(channel, payload);
                    }
                    catch (err) {
                        console.error(`[EventBus:Error] Failed parsing Redis message on channel ${channel}:`, err);
                    }
                });
                console.log(`[EventBus:RedisSub] Subscribed to Redis channel "${channel}"`);
            }
            catch (err) {
                console.error(`[EventBus:Error] Redis subscription failed for channel "${channel}":`, err.message);
            }
        }
    }
    /**
     * Publishes an event to the message bus
     * @param event The event key/channel
     * @param payload The event payload object
     */
    async publish(event, payload) {
        console.log(`[EventBus:Publish] Event "${event}" published:`, JSON.stringify(payload, null, 2));
        if (!this.isFallback && this.pubClient) {
            try {
                await this.pubClient.publish(event, JSON.stringify(payload));
                return;
            }
            catch (err) {
                console.warn(`[EventBus:Error] Redis publish failed, falling back to local:`, err.message);
            }
        }
        // Local fallback/immediate execution
        setImmediate(() => {
            this.localEmitter.emit(event, payload);
        });
    }
    /**
     * Subscribes to an event on the message bus
     * @param event The event key/channel
     * @param handler The callback to process the event
     */
    subscribe(event, handler) {
        console.log(`[EventBus:Subscribe] Registered subscriber for event "${event}"`);
        // Register handler locally
        this.localEmitter.on(event, async (payload) => {
            try {
                await handler(payload);
            }
            catch (err) {
                console.error(`[EventBus:Error] Handler failed for event "${event}":`, err);
            }
        });
        // Track subscription and setup Redis subscribe if connected
        if (!this.activeSubscriptions.has(event)) {
            this.activeSubscriptions.add(event);
            if (!this.isFallback && this.subClient) {
                this.setupRedisSubscription(event);
            }
        }
    }
}
exports.eventBus = new EventBusService();
exports.default = exports.eventBus;
//# sourceMappingURL=event-bus.js.map