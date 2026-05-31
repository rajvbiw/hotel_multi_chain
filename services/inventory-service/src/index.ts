import express from 'express';
import cors from 'cors';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { createInventoryItem, getInventory, updateStock, registerInventorySubscribers } from './controllers/inventory-controller.js';
import { authMiddleware, requireRole, errorHandler } from 'shared';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5004;
const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/restaurant_platform_inventory';

const corsOptions = {
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  credentials: true,
  maxAge: 86400
};

app.use(cors(corsOptions));
app.options('*', cors(corsOptions));
app.use(express.json());

// Request logging middleware
app.use((req, res, next) => {
  console.log(`[InventoryService] [${req.method}] ${req.url}`);
  next();
});

// Inventory Routes
app.post('/', authMiddleware, requireRole(['admin', 'superadmin']), createInventoryItem);
app.get('/', authMiddleware, getInventory);
app.put('/:id/stock', authMiddleware, requireRole(['admin', 'superadmin']), updateStock);

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'UP', service: 'inventory-service', db: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected' });
});

// Global Error Handler
app.use(errorHandler);

// Connect DB & Start Server
mongoose
  .connect(MONGO_URI)
  .then(() => {
    console.log('[InventoryService] Connected to MongoDB database.');
    
    // Register EventBus subscribers for asynchronous order stock deduction!
    registerInventorySubscribers();

    app.listen(PORT, () => {
      console.log(`🚀 Inventory Service running at http://localhost:${PORT}`);
    });
  })
  .catch((err) => {
    console.error('[InventoryService] MongoDB connection failure:', err);
    process.exit(1);
  });
