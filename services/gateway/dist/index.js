"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const http_1 = require("http");
const express_http_proxy_1 = __importDefault(require("express-http-proxy"));
const dotenv_1 = __importDefault(require("dotenv"));
const socket_js_1 = require("./socket.js");
const shared_1 = require("shared");
dotenv_1.default.config();
const app = (0, express_1.default)();
const PORT = process.env.PORT || 5000;
// CORS Configuration - Allow requests from frontend
const corsOptions = {
    origin: '*', // Allow all origins (or specify 'http://localhost:7070' for production)
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
    credentials: true,
    maxAge: 86400 // 24 hours
};
app.use((0, cors_1.default)(corsOptions));
// Explicitly handle preflight requests
app.options('*', (0, cors_1.default)(corsOptions));
// Gateway needs JSON body parser for local gateway routes, but express-http-proxy doesn't require body parsing if proxying raw body streams.
// We will specify json parser for non-proxy health-checks, or we can parsed bodies for simple handling.
app.use(express_1.default.json());
// Security headers middleware
app.use((req, res, next) => {
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('X-Frame-Options', 'DENY');
    res.setHeader('X-XSS-Protection', '1; mode=block');
    // Don't set restrictive CSP on API - allow CORS to handle security
    next();
});
// Service Endpoints (Default local microservices ports)
const AUTH_SERVICE_URL = process.env.AUTH_SERVICE_URL || 'http://auth-service:5001';
const MENU_SERVICE_URL = process.env.MENU_SERVICE_URL || 'http://menu-service:5002';
const ORDER_SERVICE_URL = process.env.ORDER_SERVICE_URL || 'http://order-service:5003';
const INVENTORY_SERVICE_URL = process.env.INVENTORY_SERVICE_URL || 'http://inventory-service:5004';
const LOYALTY_SERVICE_URL = process.env.LOYALTY_SERVICE_URL || 'http://loyalty-service:5005';
const NOTIFICATION_SERVICE_URL = process.env.NOTIFICATION_SERVICE_URL || 'http://notification-service:5006';
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
// Gateway root endpoint
app.get('/', (req, res) => {
    res.json({
        message: 'API Gateway v1',
        status: 'online',
        endpoints: {
            auth: '/api/v1/auth',
            menu: '/api/v1/menu',
            orders: '/api/v1/orders',
            inventory: '/api/v1/inventory',
            loyalty: '/api/v1/loyalty',
            notifications: '/api/v1/notifications'
        }
    });
});
// Route Reverse Proxies
app.use('/api/v1/auth', (0, express_http_proxy_1.default)(AUTH_SERVICE_URL));
app.use('/api/v1/menu', (0, express_http_proxy_1.default)(MENU_SERVICE_URL));
app.use('/api/v1/orders', (0, express_http_proxy_1.default)(ORDER_SERVICE_URL));
app.use('/api/v1/inventory', (0, express_http_proxy_1.default)(INVENTORY_SERVICE_URL));
app.use('/api/v1/loyalty', (0, express_http_proxy_1.default)(LOYALTY_SERVICE_URL));
app.use('/api/v1/notifications', (0, express_http_proxy_1.default)(NOTIFICATION_SERVICE_URL));
// Fallback error-handling for direct gateway routes
app.use(shared_1.errorHandler);
const httpServer = (0, http_1.createServer)(app);
const socketManager = new socket_js_1.SocketManager(httpServer);
httpServer.listen(PORT, () => {
    console.log(`====================================================`);
    console.log(`🚀 API Gateway running at http://localhost:${PORT}`);
    console.log(`⚡ WebSocket Hub enabled on same port`);
    console.log(`====================================================`);
});
//# sourceMappingURL=index.js.map