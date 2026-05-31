"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const mongoose_1 = __importDefault(require("mongoose"));
const dotenv_1 = __importDefault(require("dotenv"));
const branch_controller_js_1 = require("./controllers/branch-controller.js");
const menu_controller_js_1 = require("./controllers/menu-controller.js");
const recommendation_controller_js_1 = require("./controllers/recommendation-controller.js");
const shared_1 = require("shared");
dotenv_1.default.config();
const app = (0, express_1.default)();
const PORT = process.env.PORT || 5002;
const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/restaurant_platform_menu';
app.use((0, cors_1.default)());
app.use(express_1.default.json());
// Request logging middleware
app.use((req, res, next) => {
    console.log(`[MenuService] [${req.method}] ${req.url}`);
    next();
});
// Branch Routes
app.post('/branches', shared_1.authMiddleware, branch_controller_js_1.createBranch);
app.get('/branches', branch_controller_js_1.getBranches);
app.get('/branches/:id', branch_controller_js_1.getBranchById);
app.put('/branches/:id', shared_1.authMiddleware, branch_controller_js_1.updateBranch);
app.delete('/branches/:id', shared_1.authMiddleware, branch_controller_js_1.deleteBranch);
// Menu Item Routes
app.post('/items', shared_1.authMiddleware, menu_controller_js_1.createMenuItem);
app.get('/items', menu_controller_js_1.getMenuItems);
app.get('/items/:id', menu_controller_js_1.getMenuItemById);
app.put('/items/:id', shared_1.authMiddleware, menu_controller_js_1.updateMenuItem);
app.delete('/items/:id', shared_1.authMiddleware, menu_controller_js_1.deleteMenuItem);
// Review Routes
app.post('/reviews', shared_1.authMiddleware, menu_controller_js_1.createReview);
app.get('/items/:menuItemId/reviews', menu_controller_js_1.getReviewsByMenuItemId);
// AI Recommendations Route
app.get('/recommendations', recommendation_controller_js_1.getAIRecommendations);
// Health check
app.get('/health', (req, res) => {
    res.json({ status: 'UP', service: 'menu-service', db: mongoose_1.default.connection.readyState === 1 ? 'connected' : 'disconnected' });
});
// Root route matching gateway rewrite
app.get('/', menu_controller_js_1.getMenuItems);
// Global Error Handler
app.use(shared_1.errorHandler);
// Connect DB & Start Server
mongoose_1.default
    .connect(MONGO_URI)
    .then(() => {
    console.log('[MenuService] Connected to MongoDB database.');
    app.listen(PORT, () => {
        console.log(`🚀 Menu Service running at http://localhost:${PORT}`);
    });
})
    .catch((err) => {
    console.error('[MenuService] MongoDB connection failure:', err);
    process.exit(1);
});
//# sourceMappingURL=index.js.map