"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const mongoose_1 = __importDefault(require("mongoose"));
const dotenv_1 = __importDefault(require("dotenv"));
const auth_controller_js_1 = require("./controllers/auth-controller.js");
const shared_1 = require("shared");
dotenv_1.default.config();
const app = (0, express_1.default)();
const PORT = process.env.PORT || 5001;
const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/restaurant_platform_auth';
app.use((0, cors_1.default)());
app.use(express_1.default.json());
// Request logging middleware
app.use((req, res, next) => {
    console.log(`[AuthService] [${req.method}] ${req.url}`);
    next();
});
// Auth Routes
app.post('/signup', auth_controller_js_1.signup);
app.post('/login', auth_controller_js_1.login);
app.get('/me', shared_1.authMiddleware, auth_controller_js_1.getMe);
app.put('/profile', shared_1.authMiddleware, auth_controller_js_1.updateProfile);
// Health check
app.get('/health', (req, res) => {
    res.json({ status: 'UP', service: 'auth-service', db: mongoose_1.default.connection.readyState === 1 ? 'connected' : 'disconnected' });
});
// Root route matching gateway rewrite
app.post('/', auth_controller_js_1.signup);
// Global Error Handler
app.use(shared_1.errorHandler);
// Connect DB & Start Server
mongoose_1.default
    .connect(MONGO_URI)
    .then(() => {
    console.log('[AuthService] Connected to MongoDB database.');
    app.listen(PORT, () => {
        console.log(`🚀 Authentication Service running at http://localhost:${PORT}`);
    });
})
    .catch((err) => {
    console.error('[AuthService] MongoDB connection failure:', err);
    process.exit(1);
});
//# sourceMappingURL=index.js.map