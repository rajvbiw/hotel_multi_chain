import express from 'express';
import cors from 'cors';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { getNotifications, markAsRead, registerNotificationSubscribers } from './controllers/notification-controller.js';
import { authMiddleware, errorHandler } from 'shared';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5006;
const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/restaurant_platform_notifications';

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
  console.log(`[NotificationService] [${req.method}] ${req.url}`);
  next();
});

// Notification Routes
app.get('/', authMiddleware, getNotifications);
app.put('/:id/read', authMiddleware, markAsRead);

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'UP', service: 'notification-service', db: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected' });
});

// Global Error Handler
app.use(errorHandler);

// Connect DB & Start Server
mongoose
  .connect(MONGO_URI)
  .then(() => {
    console.log('[NotificationService] Connected to MongoDB database.');
    
    // Register EventBus subscribers for order and inventory status change warnings!
    registerNotificationSubscribers();

    app.listen(PORT, () => {
      console.log(`🚀 Notification Service running at http://localhost:${PORT}`);
    });
  })
  .catch((err) => {
    console.error('[NotificationService] MongoDB connection failure:', err);
    process.exit(1);
  });
