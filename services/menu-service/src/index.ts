import express from 'express';
import cors from 'cors';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { createBranch, getBranches, getBranchById, updateBranch, deleteBranch } from './controllers/branch-controller.js';
import { createMenuItem, getMenuItems, getMenuItemById, updateMenuItem, deleteMenuItem, createReview, getReviewsByMenuItemId } from './controllers/menu-controller.js';
import { getAIRecommendations } from './controllers/recommendation-controller.js';
import { authMiddleware, errorHandler } from 'shared';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5002;
const MONGO_URI = process.env.MONGODB_URI || 'mongodb://mongo:27017/restaurant_platform_menu';

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
  console.log(`[MenuService] [${req.method}] ${req.url}`);
  next();
});

// Branch Routes
app.post('/branches', authMiddleware, createBranch);
app.get('/branches', getBranches);
app.get('/branches/:id', getBranchById);
app.put('/branches/:id', authMiddleware, updateBranch);
app.delete('/branches/:id', authMiddleware, deleteBranch);

// Menu Item Routes
app.post('/items', authMiddleware, createMenuItem);
app.get('/items', getMenuItems);
app.get('/items/:id', getMenuItemById);
app.put('/items/:id', authMiddleware, updateMenuItem);
app.delete('/items/:id', authMiddleware, deleteMenuItem);

// Review Routes
app.post('/reviews', authMiddleware, createReview);
app.get('/items/:menuItemId/reviews', getReviewsByMenuItemId);

// AI Recommendations Route
app.get('/recommendations', getAIRecommendations);

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'UP', service: 'menu-service', db: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected' });
});

// Root route matching gateway rewrite
app.get('/', getMenuItems);

// Global Error Handler
app.use(errorHandler);

// Connect DB & Start Server
mongoose
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
