import { Request, Response, NextFunction } from 'express';
export declare const getLoyaltyStatus: (req: Request, res: Response, next: NextFunction) => Promise<void>;
export declare const createCoupon: (req: Request, res: Response, next: NextFunction) => Promise<void>;
export declare const getCoupons: (req: Request, res: Response, next: NextFunction) => Promise<void>;
export declare const validateCoupon: (req: Request, res: Response, next: NextFunction) => Promise<void>;
export declare const registerLoyaltySubscribers: () => void;
