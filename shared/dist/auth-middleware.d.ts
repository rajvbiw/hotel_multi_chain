import { Request, Response, NextFunction } from 'express';
export interface UserPayload {
    id: string;
    name?: string;
    email: string;
    role: 'customer' | 'admin' | 'kitchen' | 'superadmin';
    branchId?: string;
}
declare global {
    namespace Express {
        interface Request {
            user?: UserPayload;
        }
    }
}
export declare const JWT_SECRET: string;
export declare const authMiddleware: (req: Request, res: Response, next: NextFunction) => void;
export declare const requireRole: (roles: Array<"customer" | "admin" | "kitchen" | "superadmin">) => (req: Request, res: Response, next: NextFunction) => void;
