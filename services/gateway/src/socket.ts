import { Server as HttpServer } from 'http';
import { Server, Socket } from 'socket.io';
import { eventBus } from 'shared';

export class SocketManager {
  private io: Server;

  constructor(server: HttpServer) {
    this.io = new Server(server, {
      cors: {
        origin: '*', // Allow all origins for simplicity in development
        methods: ['GET', 'POST'],
      },
    });

    this.initialize();
  }

  private initialize() {
    this.io.on('connection', (socket: Socket) => {
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
    eventBus.subscribe('order.created', (payload: any) => {
      // Notify all branch admins and kitchen staff of the new order
      if (payload.branchId) {
        this.io.to(`branch:${payload.branchId}`).to('role:kitchen').to('role:admin').to('role:superadmin').emit('order_created', payload);
      }
    });

    eventBus.subscribe('order.status_updated', (payload: any) => {
      // Notify the specific customer tracking their order
      if (payload.userId) {
        this.io.to(`user:${payload.userId}`).emit('order_status_changed', payload);
      }
      // Notify the branch/kitchen staff
      if (payload.branchId) {
        this.io.to(`branch:${payload.branchId}`).to('role:kitchen').to('role:admin').to('role:superadmin').emit('order_status_changed', payload);
      }
    });

    eventBus.subscribe('inventory.low_stock', (payload: any) => {
      // Notify the branch admin and super admins of low stock alerts
      if (payload.branchId) {
        this.io.to(`branch:${payload.branchId}`).to('role:admin').to('role:superadmin').emit('low_stock_alert', payload);
      }
    });

    eventBus.subscribe('notification.created', (payload: any) => {
      // Push generic/custom notifications to the targeted user
      if (payload.userId) {
        this.io.to(`user:${payload.userId}`).emit('notification_received', payload);
      }
    });
  }

  public sendToUser(userId: string, event: string, data: any) {
    this.io.to(`user:${userId}`).emit(event, data);
  }

  public sendToRoom(room: string, event: string, data: any) {
    this.io.to(room).emit(event, data);
  }

  public broadcast(event: string, data: any) {
    this.io.emit(event, data);
  }
}

export default SocketManager;
