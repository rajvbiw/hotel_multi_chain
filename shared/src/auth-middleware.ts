import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { UnauthorizedError, ForbiddenError } from './errors.js';

export interface UserPayload {
  id: string;
  email: string;
  role: 'customer' | 'admin' | 'kitchen' | 'superadmin';
  branchId?: string;
}

// Extend Express Request interface
declare global {
  namespace Express {
    interface Request {
      user?: UserPayload;
    }
  }
}

export const JWT_SECRET = process.env.JWT_SECRET || 'super-secret-key-restaurant-platform';

export const authMiddleware = (req: Request, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    throw new UnauthorizedError('Authentication token missing or invalid');
  }

  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as UserPayload;
    req.user = decoded;
    next();
  } catch (err) {
    throw new UnauthorizedError('Invalid or expired token');
  }
};

export const requireRole = (roles: Array<'customer' | 'admin' | 'kitchen' | 'superadmin'>) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      throw new UnauthorizedError('Authentication required');
    }

    if (!roles.includes(req.user.role)) {
      throw new ForbiddenError('You do not have permission to access this resource');
    }

    next();
  };
};
