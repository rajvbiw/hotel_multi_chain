import { EventEmitter } from 'events';
import { createClient, RedisClientType } from 'redis';

export type EventCallback = (payload: any) => void | Promise<void>;

class EventBusService {
  private localEmitter = new EventEmitter();
  private pubClient: RedisClientType | null = null;
  private subClient: RedisClientType | null = null;
  private isFallback = true;
  private activeSubscriptions = new Set<string>();

  constructor() {
    this.localEmitter.setMaxListeners(100);
    this.initializeRedis();
  }

  private async initializeRedis() {
    const redisUrl = process.env.REDIS_URL || 'redis://localhost:6379';
    try {
      console.log(`[EventBus] Connecting to Redis Pub/Sub at ${redisUrl}...`);
      this.pubClient = createClient({ url: redisUrl });
      this.subClient = this.pubClient.duplicate();

      const handleError = (err: any) => {
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
    } catch (err: any) {
      console.warn('[EventBus] Failed to connect to Redis Pub/Sub. Using local in-memory fallback. Error:', err.message);
      this.isFallback = true;
      this.pubClient = null;
      this.subClient = null;
    }
  }

  private async setupRedisSubscription(channel: string) {
    if (this.subClient) {
      try {
        await this.subClient.subscribe(channel, (message) => {
          try {
            console.log(`[EventBus:RedisSub] Received broadcast for "${channel}"`);
            const payload = JSON.parse(message);
            this.localEmitter.emit(channel, payload);
          } catch (err) {
            console.error(`[EventBus:Error] Failed parsing Redis message on channel ${channel}:`, err);
          }
        });
        console.log(`[EventBus:RedisSub] Subscribed to Redis channel "${channel}"`);
      } catch (err: any) {
        console.error(`[EventBus:Error] Redis subscription failed for channel "${channel}":`, err.message);
      }
    }
  }

  /**
   * Publishes an event to the message bus
   * @param event The event key/channel
   * @param payload The event payload object
   */
  public async publish(event: string, payload: any): Promise<void> {
    console.log(`[EventBus:Publish] Event "${event}" published:`, JSON.stringify(payload, null, 2));

    if (!this.isFallback && this.pubClient) {
      try {
        await this.pubClient.publish(event, JSON.stringify(payload));
        return;
      } catch (err: any) {
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
  public subscribe(event: string, handler: EventCallback): void {
    console.log(`[EventBus:Subscribe] Registered subscriber for event "${event}"`);

    // Register handler locally
    this.localEmitter.on(event, async (payload) => {
      try {
        await handler(payload);
      } catch (err) {
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

export const eventBus = new EventBusService();
export default eventBus;
