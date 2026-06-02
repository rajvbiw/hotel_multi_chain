"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const mongoose_1 = __importDefault(require("mongoose"));
const dotenv_1 = __importDefault(require("dotenv"));
const loyalty_controller_js_1 = require("./controllers/loyalty-controller.js");
const shared_1 = require("shared");
dotenv_1.default.config();
const app = (0, express_1.default)();
const PORT = process.env.PORT || 5005;
const MONGO_URI = process.env.MONGODB_URI || 'mongodb://mongo:27017/restaurant_platform_loyalty';
const corsOptions = {
    origin: '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
    credentials: true,
    maxAge: 86400
};
app.use((0, cors_1.default)(corsOptions));
app.options('*', (0, cors_1.default)(corsOptions));
app.use(express_1.default.json());
// Request logging middleware
app.use((req, res, next) => {
    console.log(`[LoyaltyService] [${req.method}] ${req.url}`);
    next();
});
// Loyalty & Coupon Routes
app.get('/status', shared_1.authMiddleware, loyalty_controller_js_1.getLoyaltyStatus);
app.post('/coupons', shared_1.authMiddleware, (0, shared_1.requireRole)(['admin', 'superadmin']), loyalty_controller_js_1.createCoupon);
app.get('/coupons', loyalty_controller_js_1.getCoupons);
app.post('/coupons/validate', loyalty_controller_js_1.validateCoupon);
// Health check
app.get('/health', (req, res) => {
    res.json({ status: 'UP', service: 'loyalty-service', db: mongoose_1.default.connection.readyState === 1 ? 'connected' : 'disconnected' });
});
// Global Error Handler
app.use(shared_1.errorHandler);
// Connect DB & Start Server
mongoose_1.default
    .connect(MONGO_URI)
    .then(() => {
    console.log('[LoyaltyService] Connected to MongoDB database.');
    // Register EventBus subscriber for points accrual
    (0, loyalty_controller_js_1.registerLoyaltySubscribers)();
    app.listen(PORT, () => {
        console.log(`🚀 Loyalty Service running at http://localhost:${PORT}`);
    });
})
    .catch((err) => {
    console.error('[LoyaltyService] MongoDB connection failure:', err);
    process.exit(1);
});
//# sourceMappingURL=index.js.map