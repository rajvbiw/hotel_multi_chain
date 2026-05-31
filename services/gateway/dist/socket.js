"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SocketManager = void 0;
const socket_io_1 = require("socket.io");
const shared_1 = require("shared");
class SocketManager {
    io;
    constructor(server) {
        this.io = new socket_io_1.Server(server, {
            cors: {
                origin: '*', // Allow all origins for simplicity in development
                methods: ['GET', 'POST'],
            },
        });
        this.initialize();
    }
    initialize() {
        this.io.on('connection', (socket) => {
            const { userId, role, branchId } = socket.handshake.query;
            console.log(`[Socket] Client connected: ${socket.id} (User: ${userId}, Role: ${role}, Branch: ${branchId})`);
            // Join standard rooms
            if (userId) {
                socket.join(`user:${userId}`);
            }
            if (role) {
                socket.join(`role:${role}`);
            }
            if (branchId) {
                socket.join(`branch:${branchId}`);
            }
            socket.on('disconnect', () => {
                console.log(`[Socket] Client disconnected: ${socket.id}`);
            });
        });
        // Subscribe SocketManager to our core asynchronous EventBus to forward microservice backend events directly to real-time browser clients!
        shared_1.eventBus.subscribe('order.created', (payload) => {
            // Notify all branch admins and kitchen staff of the new order
            if (payload.branchId) {
                this.io.to(`branch:${payload.branchId}`).to('role:kitchen').to('role:admin').to('role:superadmin').emit('order_created', payload);
            }
        });
        shared_1.eventBus.subscribe('order.status_updated', (payload) => {
            // Notify the specific customer tracking their order
            if (payload.userId) {
                this.io.to(`user:${payload.userId}`).emit('order_status_changed', payload);
            }
            // Notify the branch/kitchen staff
            if (payload.branchId) {
                this.io.to(`branch:${payload.branchId}`).to('role:kitchen').to('role:admin').to('role:superadmin').emit('order_status_changed', payload);
            }
        });
        shared_1.eventBus.subscribe('inventory.low_stock', (payload) => {
            // Notify the branch admin and super admins of low stock alerts
            if (payload.branchId) {
                this.io.to(`branch:${payload.branchId}`).to('role:admin').to('role:superadmin').emit('low_stock_alert', payload);
            }
        });
        shared_1.eventBus.subscribe('notification.created', (payload) => {
            // Push generic/custom notifications to the targeted user
            if (payload.userId) {
                this.io.to(`user:${payload.userId}`).emit('notification_received', payload);
            }
        });
    }
    sendToUser(userId, event, data) {
        this.io.to(`user:${userId}`).emit(event, data);
    }
    sendToRoom(room, event, data) {
        this.io.to(room).emit(event, data);
    }
    broadcast(event, data) {
        this.io.emit(event, data);
    }
}
exports.SocketManager = SocketManager;
exports.default = SocketManager;
//# sourceMappingURL=socket.js.map