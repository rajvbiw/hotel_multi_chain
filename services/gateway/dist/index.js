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
app.use((0, cors_1.default)());
// Gateway needs JSON body parser for local gateway routes, but express-http-proxy doesn't require body parsing if proxying raw body streams.
// We will specify json parser for non-proxy health-checks, or we can parsed bodies for simple handling.
app.use(express_1.default.json());
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