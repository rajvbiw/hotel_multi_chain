import { Request, Response, NextFunction } from 'express';
import { Branch } from '../models/branch.js';
import { BadRequestError, NotFoundError } from 'shared';

export const createBranch = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { name, address, city, phone, coords } = req.body;

    if (!name || !address || !city || !phone || !coords) {
      throw new BadRequestError('Name, address, city, phone, and coords are required');
    }

    const branch = new Branch({
      name,
      address,
      city,
      phone,
      coords,
    });

    await branch.save();

    res.status(201).json({
      success: true,
      message: 'Branch created successfully',
      data: branch,
    });
  } catch (err) {
    next(err);
  }
};

export const getBranches = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const branches = await Branch.find({ isActive: true });
    res.json({
      success: true,
      data: branches,
    });
  } catch (err) {
    next(err);
  }
};

export const getBranchById = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const branch = await Branch.findById(req.params.id);
    if (!branch) {
      throw new NotFoundError('Branch not found');
    }
    res.json({
      success: true,
      data: branch,
    });
  } catch (err) {
    next(err);
  }
};

export const updateBranch = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const branch = await Branch.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!branch) {
      throw new NotFoundError('Branch not found');
    }
    res.json({
      success: true,
      message: 'Branch updated successfully',
      data: branch,
    });
  } catch (err) {
    next(err);
  }
};

export const deleteBranch = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const branch = await Branch.findByIdAndDelete(req.params.id);
    if (!branch) {
      throw new NotFoundError('Branch not found');
    }
    res.json({
      success: true,
      message: 'Branch deleted successfully',
    });
  } catch (err) {
    next(err);
  }
};
