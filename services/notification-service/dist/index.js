"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const mongoose_1 = __importDefault(require("mongoose"));
const dotenv_1 = __importDefault(require("dotenv"));
const notification_controller_js_1 = require("./controllers/notification-controller.js");
const shared_1 = require("shared");
dotenv_1.default.config();
const app = (0, express_1.default)();
const PORT = process.env.PORT || 5006;
const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/restaurant_platform_notifications';
app.use((0, cors_1.default)());
app.use(express_1.default.json());
// Request logging middleware
app.use((req, res, next) => {
    console.log(`[NotificationService] [${req.method}] ${req.url}`);
    next();
});
// Notification Routes
app.get('/', shared_1.authMiddleware, notification_controller_js_1.getNotifications);
app.put('/:id/read', shared_1.authMiddleware, notification_controller_js_1.markAsRead);
// Health check
app.get('/health', (req, res) => {
    res.json({ status: 'UP', service: 'notification-service', db: mongoose_1.default.connection.readyState === 1 ? 'connected' : 'disconnected' });
});
// Global Error Handler
app.use(shared_1.errorHandler);
// Connect DB & Start Server
mongoose_1.default
    .connect(MONGO_URI)
    .then(() => {
    console.log('[NotificationService] Connected to MongoDB database.');
    // Register EventBus subscribers for order and inventory status change warnings!
    (0, notification_controller_js_1.registerNotificationSubscribers)();
    app.listen(PORT, () => {
        console.log(`🚀 Notification Service running at http://localhost:${PORT}`);
    });
})
    .catch((err) => {
    console.error('[NotificationService] MongoDB connection failure:', err);
    process.exit(1);
});
//# sourceMappingURL=index.js.map