import express from 'express';
import cors from 'cors';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { signup, login, getMe, updateProfile } from './controllers/auth-controller.js';
import { User } from './models/user.js';
import { authMiddleware, errorHandler } from 'shared';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5001;
const MONGO_URI = process.env.MONGODB_URI || 'mongodb://mongo:27017/restaurant_platform_auth';

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
  console.log(`[AuthService] [${req.method}] ${req.url}`);
  next();
});

// Auth Routes
app.post('/signup', signup);
app.post('/login', login);
app.get('/me', authMiddleware, getMe);
app.put('/profile', authMiddleware, updateProfile);

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'UP', service: 'auth-service', db: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected' });
});

// Root route matching gateway rewrite
app.post('/', signup);

// Global Error Handler
app.use(errorHandler);

// Connect DB & Start Server
mongoose
  .connect(MONGO_URI)
  .then(async () => {
    console.log('[AuthService] Connected to MongoDB database.');
    
    // Ensure a default superadmin user exists for quick login
    const ensureDefaultUser = async () => {
      const existing = await User.findOne({ email: 'superadmin@restaurant.com' });
      if (!existing) {
        const defaultUser = new User({
          name: 'Super Admin',
          email: 'superadmin@restaurant.com',
          password: 'password123',
          role: 'superadmin',
          branchId: null,
        });
        await defaultUser.save();
        console.log('[AuthService] Created default superadmin user');
      }
    };
    await ensureDefaultUser();

    app.listen(PORT, () => {
      console.log(`🚀 Authentication Service running at http://localhost:${PORT}`);
    });
  })
  .catch((err) => {
    console.error('[AuthService] MongoDB connection failure:', err);
    process.exit(1);
  });
