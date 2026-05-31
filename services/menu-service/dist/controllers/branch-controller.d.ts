import { Request, Response, NextFunction } from 'express';
export declare const createBranch: (req: Request, res: Response, next: NextFunction) => Promise<void>;
export declare const getBranches: (req: Request, res: Response, next: NextFunction) => Promise<void>;
export declare const getBranchById: (req: Request, res: Response, next: NextFunction) => Promise<void>;
export declare const updateBranch: (req: Request, res: Response, next: NextFunction) => Promise<void>;
export declare const deleteBranch: (req: Request, res: Response, next: NextFunction) => Promise<void>;
