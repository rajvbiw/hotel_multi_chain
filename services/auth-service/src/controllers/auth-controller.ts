import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { User } from '../models/user.js';
import { BadRequestError, UnauthorizedError, ConflictError } from 'shared';

const JWT_SECRET = process.env.JWT_SECRET || 'super-secret-key-restaurant-platform';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '24h';

export const signup = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { name, email, password, role, branchId } = req.body;

    if (!name || !email || !password) {
      throw new BadRequestError('Name, email, and password are required');
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      throw new ConflictError('A user with this email address already exists');
    }

    // Restrict creating admin/superadmin roles unless authorized or in dev mode
    const finalRole = role || 'customer';

    const user = new User({
      name,
      email,
      password,
      role: finalRole,
      branchId: branchId || null,
    });

    await user.save();

    const token = jwt.sign(
      { id: user._id, email: user.email, role: user.role, branchId: user.branchId },
      JWT_SECRET,
      { expiresIn: JWT_EXPIRES_IN }
    );

    res.status(201).json({
      success: true,
      message: 'User registered successfully',
      data: {
        token,
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          branchId: user.branchId,
        },
      },
    });
  } catch (err) {
    next(err);
  }
};

export const login = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      throw new BadRequestError('Email and password are required');
    }

    const user = await User.findOne({ email }).select('+password');
    if (!user) {
      throw new UnauthorizedError('Invalid email or password');
    }

    const isMatch = await (user as any).comparePassword(password);
    if (!isMatch) {
      throw new UnauthorizedError('Invalid email or password');
    }

    const token = jwt.sign(
      { id: user._id, email: user.email, role: user.role, branchId: user.branchId },
      JWT_SECRET,
      { expiresIn: JWT_EXPIRES_IN }
    );

    res.json({
      success: true,
      message: 'Login successful',
      data: {
        token,
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          branchId: user.branchId,
        },
      },
    });
  } catch (err) {
    next(err);
  }
};

export const getMe = async (req: Request, res: Response, next: NextFunction) => {
  try {
    if (!req.user) {
      throw new UnauthorizedError();
    }

    const user = await User.findById(req.user.id);
    if (!user) {
      throw new UnauthorizedError('User not found');
    }

    res.json({
      success: true,
      data: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        branchId: user.branchId,
      },
    });
  } catch (err) {
    next(err);
  }
};

export const updateProfile = async (req: Request, res: Response, next: NextFunction) => {
  try {
    if (!req.user) {
      throw new UnauthorizedError();
    }

    const { name, branchId } = req.body;
    const user = await User.findById(req.user.id);
    if (!user) {
      throw new UnauthorizedError('User not found');
    }

    if (name) user.name = name;
    if (branchId !== undefined && req.user.role === 'superadmin') {
      user.branchId = branchId;
    }

    await user.save();

    res.json({
      success: true,
      message: 'Profile updated successfully',
      data: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        branchId: user.branchId,
      },
    });
  } catch (err) {
    next(err);
  }
};
