import express from 'express';
import cors from 'cors';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { createOrder, getOrders, getOrderById, updateOrderStatus, getAnalytics } from './controllers/order-controller.js';
import { authMiddleware, requireRole, errorHandler } from 'shared';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5003;
const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/restaurant_platform_orders';

app.use(cors());
app.use(express.json());

// Request logging middleware
app.use((req, res, next) => {
  console.log(`[OrderService] [${req.method}] ${req.url}`);
  next();
});

// Order Routes
app.post('/', authMiddleware, createOrder);
app.get('/', authMiddleware, getOrders);
app.get('/analytics', authMiddleware, requireRole(['admin', 'superadmin']), getAnalytics);
app.get('/:id', authMiddleware, getOrderById);
app.put('/:id/status', authMiddleware, updateOrderStatus);

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'UP', service: 'order-service', db: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected' });
});

// Global Error Handler
app.use(errorHandler);

// Connect DB & Start Server
mongoose
  .connect(MONGO_URI)
  .then(() => {
    console.log('[OrderService] Connected to MongoDB database.');
    app.listen(PORT, () => {
      console.log(`🚀 Order Service running at http://localhost:${PORT}`);
    });
  })
  .catch((err) => {
    console.error('[OrderService] MongoDB connection failure:', err);
    process.exit(1);
  });
