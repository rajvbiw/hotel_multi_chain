import express from 'express';
import cors from 'cors';
import { createServer } from 'http';
import proxy from 'express-http-proxy';
import dotenv from 'dotenv';
import { SocketManager } from './socket.js';
import { errorHandler } from 'shared';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
// Gateway needs JSON body parser for local gateway routes, but express-http-proxy doesn't require body parsing if proxying raw body streams.
// We will specify json parser for non-proxy health-checks, or we can parsed bodies for simple handling.
app.use(express.json());

// Service Endpoints (Default local microservices ports)
const AUTH_SERVICE_URL = process.env.AUTH_SERVICE_URL || 'http://localhost:5001';
const MENU_SERVICE_URL = process.env.MENU_SERVICE_URL || 'http://localhost:5002';
const ORDER_SERVICE_URL = process.env.ORDER_SERVICE_URL || 'http://localhost:5003';
const INVENTORY_SERVICE_URL = process.env.INVENTORY_SERVICE_URL || 'http://localhost:5004';
const LOYALTY_SERVICE_URL = process.env.LOYALTY_SERVICE_URL || 'http://localhost:5005';
const NOTIFICATION_SERVICE_URL = process.env.NOTIFICATION_SERVICE_URL || 'http://localhost:5006';

// Request Logging
app.use((req, res, next) => {
  console.log(`[Gateway] [${req.method}] ${req.url}`);
  next();
});

// Gateway Health check
app.get('/health', (req, res) => {
  res.json({
    status: 'UP',
    gateway: 'healthy',
    timestamp: new Date().toISOString()
  });
});

// Route Reverse Proxies
app.use('/api/v1/auth', proxy(AUTH_SERVICE_URL));
app.use('/api/v1/menu', proxy(MENU_SERVICE_URL));
app.use('/api/v1/orders', proxy(ORDER_SERVICE_URL));
app.use('/api/v1/inventory', proxy(INVENTORY_SERVICE_URL));
app.use('/api/v1/loyalty', proxy(LOYALTY_SERVICE_URL));
app.use('/api/v1/notifications', proxy(NOTIFICATION_SERVICE_URL));

// Fallback error-handling for direct gateway routes
app.use(errorHandler);

const httpServer = createServer(app);
const socketManager = new SocketManager(httpServer);

httpServer.listen(PORT, () => {
  console.log(`====================================================`);
  console.log(`🚀 API Gateway running at http://localhost:${PORT}`);
  console.log(`⚡ WebSocket Hub enabled on same port`);
  console.log(`====================================================`);
});
