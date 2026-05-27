"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.eventBus = void 0;
const events_1 = require("events");
class EventBusService {
    localEmitter = new events_1.EventEmitter();
    constructor() {
        this.localEmitter.setMaxListeners(100);
    }
    /**
     * Publishes an event to the message bus
     * @param event The event key/channel
     * @param payload The event payload object
     */
    async publish(event, payload) {
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
    subscribe(event, handler) {
        console.log(`[EventBus:Subscribe] Registered subscriber for event "${event}"`);
        this.localEmitter.on(event, async (payload) => {
            try {
                await handler(payload);
            }
            catch (err) {
                console.error(`[EventBus:Error] Handler failed for event "${event}":`, err);
            }
        });
    }
}
exports.eventBus = new EventBusService();
exports.default = exports.eventBus;
//# sourceMappingURL=event-bus.js.map