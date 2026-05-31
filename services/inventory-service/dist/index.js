"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const mongoose_1 = __importDefault(require("mongoose"));
const dotenv_1 = __importDefault(require("dotenv"));
const inventory_controller_js_1 = require("./controllers/inventory-controller.js");
const shared_1 = require("shared");
dotenv_1.default.config();
const app = (0, express_1.default)();
const PORT = process.env.PORT || 5004;
const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/restaurant_platform_inventory';
app.use((0, cors_1.default)());
app.use(express_1.default.json());
// Request logging middleware
app.use((req, res, next) => {
    console.log(`[InventoryService] [${req.method}] ${req.url}`);
    next();
});
// Inventory Routes
app.post('/', shared_1.authMiddleware, (0, shared_1.requireRole)(['admin', 'superadmin']), inventory_controller_js_1.createInventoryItem);
app.get('/', shared_1.authMiddleware, inventory_controller_js_1.getInventory);
app.put('/:id/stock', shared_1.authMiddleware, (0, shared_1.requireRole)(['admin', 'superadmin']), inventory_controller_js_1.updateStock);
// Health check
app.get('/health', (req, res) => {
    res.json({ status: 'UP', service: 'inventory-service', db: mongoose_1.default.connection.readyState === 1 ? 'connected' : 'disconnected' });
});
// Global Error Handler
app.use(shared_1.errorHandler);
// Connect DB & Start Server
mongoose_1.default
    .connect(MONGO_URI)
    .then(() => {
    console.log('[InventoryService] Connected to MongoDB database.');
    // Register EventBus subscribers for asynchronous order stock deduction!
    (0, inventory_controller_js_1.registerInventorySubscribers)();
    app.listen(PORT, () => {
        console.log(`🚀 Inventory Service running at http://localhost:${PORT}`);
    });
})
    .catch((err) => {
    console.error('[InventoryService] MongoDB connection failure:', err);
    process.exit(1);
});
//# sourceMappingURL=index.js.map