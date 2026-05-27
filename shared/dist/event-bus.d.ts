export type EventCallback = (payload: any) => void | Promise<void>;
declare class EventBusService {
    private localEmitter;
    constructor();
    /**
     * Publishes an event to the message bus
     * @param event The event key/channel
     * @param payload The event payload object
     */
    publish(event: string, payload: any): Promise<void>;
    /**
     * Subscribes to an event on the message bus
     * @param event The event key/channel
     * @param handler The callback to process the event
     */
    subscribe(event: string, handler: EventCallback): void;
}
export declare const eventBus: EventBusService;
export default eventBus;
