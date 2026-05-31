import { Server as HttpServer } from 'http';
export declare class SocketManager {
    private io;
    constructor(server: HttpServer);
    private initialize;
    sendToUser(userId: string, event: string, data: any): void;
    sendToRoom(room: string, event: string, data: any): void;
    broadcast(event: string, data: any): void;
}
export default SocketManager;
