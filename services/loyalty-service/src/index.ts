import express from 'express';
import cors from 'cors';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { getLoyaltyStatus, createCoupon, getCoupons, validateCoupon, registerLoyaltySubscribers } from './controllers/loyalty-controller.js';
import { authMiddleware, requireRole, errorHandler } from 'shared';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5005;
const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/restaurant_platform_loyalty';

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
  console.log(`[LoyaltyService] [${req.method}] ${req.url}`);
  next();
});

// Loyalty & Coupon Routes
app.get('/status', authMiddleware, getLoyaltyStatus);
app.post('/coupons', authMiddleware, requireRole(['admin', 'superadmin']), createCoupon);
app.get('/coupons', getCoupons);
app.post('/coupons/validate', validateCoupon);

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'UP', service: 'loyalty-service', db: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected' });
});

// Global Error Handler
app.use(errorHandler);

// Connect DB & Start Server
mongoose
  .connect(MONGO_URI)
  .then(() => {
    console.log('[LoyaltyService] Connected to MongoDB database.');
    
    // Register EventBus subscriber for points accrual
    registerLoyaltySubscribers();

    app.listen(PORT, () => {
      console.log(`🚀 Loyalty Service running at http://localhost:${PORT}`);
    });
  })
  .catch((err) => {
    console.error('[LoyaltyService] MongoDB connection failure:', err);
    process.exit(1);
  });
