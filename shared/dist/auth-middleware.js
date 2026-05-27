"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.requireRole = exports.authMiddleware = exports.JWT_SECRET = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const errors_js_1 = require("./errors.js");
exports.JWT_SECRET = process.env.JWT_SECRET || 'super-secret-key-restaurant-platform';
const authMiddleware = (req, res, next) => {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        throw new errors_js_1.UnauthorizedError('Authentication token missing or invalid');
    }
    const token = authHeader.split(' ')[1];
    try {
        const decoded = jsonwebtoken_1.default.verify(token, exports.JWT_SECRET);
        req.user = decoded;
        next();
    }
    catch (err) {
        throw new errors_js_1.UnauthorizedError('Invalid or expired token');
    }
};
exports.authMiddleware = authMiddleware;
const requireRole = (roles) => {
    return (req, res, next) => {
        if (!req.user) {
            throw new errors_js_1.UnauthorizedError('Authentication required');
        }
        if (!roles.includes(req.user.role)) {
            throw new errors_js_1.ForbiddenError('You do not have permission to access this resource');
        }
        next();
    };
};
exports.requireRole = requireRole;
//# sourceMappingURL=auth-middleware.js.map