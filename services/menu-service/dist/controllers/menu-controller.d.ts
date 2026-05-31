import { Request, Response, NextFunction } from 'express';
export declare const createMenuItem: (req: Request, res: Response, next: NextFunction) => Promise<void>;
export declare const getMenuItems: (req: Request, res: Response, next: NextFunction) => Promise<void>;
export declare const getMenuItemById: (req: Request, res: Response, next: NextFunction) => Promise<void>;
export declare const updateMenuItem: (req: Request, res: Response, next: NextFunction) => Promise<void>;
export declare const deleteMenuItem: (req: Request, res: Response, next: NextFunction) => Promise<void>;
export declare const createReview: (req: Request, res: Response, next: NextFunction) => Promise<void>;
export declare const getReviewsByMenuItemId: (req: Request, res: Response, next: NextFunction) => Promise<void>;
