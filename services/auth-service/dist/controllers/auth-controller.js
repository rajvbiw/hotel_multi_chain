"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateProfile = exports.getMe = exports.login = exports.signup = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const user_js_1 = require("../models/user.js");
const shared_1 = require("shared");
const JWT_SECRET = process.env.JWT_SECRET || 'super-secret-key-restaurant-platform';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '24h';
const signup = async (req, res, next) => {
    try {
        const { name, email, password, role, branchId } = req.body;
        if (!name || !email || !password) {
            throw new shared_1.BadRequestError('Name, email, and password are required');
        }
        const existingUser = await user_js_1.User.findOne({ email });
        if (existingUser) {
            throw new shared_1.ConflictError('A user with this email address already exists');
        }
        // Restrict creating admin/superadmin roles unless authorized or in dev mode
        const finalRole = role || 'customer';
        const user = new user_js_1.User({
            name,
            email,
            password,
            role: finalRole,
            branchId: branchId || null,
        });
        await user.save();
        const token = jsonwebtoken_1.default.sign({ id: user._id, name: user.name, email: user.email, role: user.role, branchId: user.branchId }, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
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
    }
    catch (err) {
        next(err);
    }
};
exports.signup = signup;
const login = async (req, res, next) => {
    try {
        const { email, password } = req.body;
        if (!email || !password) {
            throw new shared_1.BadRequestError('Email and password are required');
        }
        const user = await user_js_1.User.findOne({ email }).select('+password');
        if (!user) {
            throw new shared_1.UnauthorizedError('Invalid email or password');
        }
        const isMatch = await user.comparePassword(password);
        if (!isMatch) {
            throw new shared_1.UnauthorizedError('Invalid email or password');
        }
        const token = jsonwebtoken_1.default.sign({ id: user._id, name: user.name, email: user.email, role: user.role, branchId: user.branchId }, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
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
    }
    catch (err) {
        next(err);
    }
};
exports.login = login;
const getMe = async (req, res, next) => {
    try {
        if (!req.user) {
            throw new shared_1.UnauthorizedError();
        }
        const user = await user_js_1.User.findById(req.user.id);
        if (!user) {
            throw new shared_1.UnauthorizedError('User not found');
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
    }
    catch (err) {
        next(err);
    }
};
exports.getMe = getMe;
const updateProfile = async (req, res, next) => {
    try {
        if (!req.user) {
            throw new shared_1.UnauthorizedError();
        }
        const { name, branchId } = req.body;
        const user = await user_js_1.User.findById(req.user.id);
        if (!user) {
            throw new shared_1.UnauthorizedError('User not found');
        }
        if (name)
            user.name = name;
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
    }
    catch (err) {
        next(err);
    }
};
exports.updateProfile = updateProfile;
//# sourceMappingURL=auth-controller.js.map