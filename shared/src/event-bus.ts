import { EventEmitter } from 'events';

export type EventCallback = (payload: any) => void | Promise<void>;

class EventBusService {
  private localEmitter = new EventEmitter();

  constructor() {
    this.localEmitter.setMaxListeners(100);
  }

  /**
   * Publishes an event to the message bus
   * @param event The event key/channel
   * @param payload The event payload object
   */
  public async publish(event: string, payload: any): Promise<void> {
    console.log(`[EventBus:Publish] Event "${event}" published:`, JSON.stringify(payload, null, 2));
    
    // Defer execution slightly to mimic asynchronous message queue processing
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
    
    this.localEmitter.on(event, async (payload) => {
      try {
        await handler(payload);
      } catch (err) {
        console.error(`[EventBus:Error] Handler failed for event "${event}":`, err);
      }
    });
  }
}

export const eventBus = new EventBusService();
export default eventBus;
