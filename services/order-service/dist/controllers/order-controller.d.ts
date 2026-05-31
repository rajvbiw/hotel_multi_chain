import { Request, Response, NextFunction } from 'express';
export declare const createOrder: (req: Request, res: Response, next: NextFunction) => Promise<void>;
export declare const getOrders: (req: Request, res: Response, next: NextFunction) => Promise<void>;
export declare const getOrderById: (req: Request, res: Response, next: NextFunction) => Promise<void>;
export declare const updateOrderStatus: (req: Request, res: Response, next: NextFunction) => Promise<void>;
export declare const getAnalytics: (req: Request, res: Response, next: NextFunction) => Promise<void>;
