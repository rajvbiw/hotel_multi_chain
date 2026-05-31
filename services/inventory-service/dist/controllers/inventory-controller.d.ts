import { Request, Response, NextFunction } from 'express';
export declare const createInventoryItem: (req: Request, res: Response, next: NextFunction) => Promise<void>;
export declare const getInventory: (req: Request, res: Response, next: NextFunction) => Promise<void>;
export declare const updateStock: (req: Request, res: Response, next: NextFunction) => Promise<void>;
export declare const registerInventorySubscribers: () => void;
