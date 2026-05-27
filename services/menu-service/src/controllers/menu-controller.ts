import { Request, Response, NextFunction } from 'express';
import { MenuItem } from '../models/menu-item.js';
import { Review } from '../models/review.js';
import { BadRequestError, NotFoundError } from 'shared';

export const createMenuItem = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { name, description, price, category, imageUrl, isVegetarian, branchIds, nutritionalInfo, ingredients } = req.body;

    if (!name || !description || !price || !category || !imageUrl || !branchIds) {
      throw new BadRequestError('Required fields: name, description, price, category, imageUrl, and branchIds');
    }

    const menuItem = new MenuItem({
      name,
      description,
      price,
      category,
      imageUrl,
      isVegetarian: !!isVegetarian,
      branchIds,
      nutritionalInfo: nutritionalInfo || {},
      ingredients: ingredients || [],
    });

    await menuItem.save();

    res.status(201).json({
      success: true,
      message: 'Menu item created successfully',
      data: menuItem,
    });
  } catch (err) {
    next(err);
  }
};

export const getMenuItems = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { branchId, category, search } = req.query;

    const query: any = { isAvailable: true };

    if (branchId) {
      query.branchIds = branchId;
    }
    if (category) {
      query.category = category;
    }
    if (search) {
      query.name = { $regex: search, $options: 'i' };
    }

    const menuItems = await MenuItem.find(query);
    res.json({
      success: true,
      data: menuItems,
    });
  } catch (err) {
    next(err);
  }
};

export const getMenuItemById = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const menuItem = await MenuItem.findById(req.params.id);
    if (!menuItem) {
      throw new NotFoundError('Menu item not found');
    }
    res.json({
      success: true,
      data: menuItem,
    });
  } catch (err) {
    next(err);
  }
};

export const updateMenuItem = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const menuItem = await MenuItem.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!menuItem) {
      throw new NotFoundError('Menu item not found');
    }
    res.json({
      success: true,
      message: 'Menu item updated successfully',
      data: menuItem,
    });
  } catch (err) {
    next(err);
  }
};

export const deleteMenuItem = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const menuItem = await MenuItem.findByIdAndDelete(req.params.id);
    if (!menuItem) {
      throw new NotFoundError('Menu item not found');
    }
    res.json({
      success: true,
      message: 'Menu item deleted successfully',
    });
  } catch (err) {
    next(err);
  }
};

export const createReview = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { menuItemId, rating, comment } = req.body;
    if (!req.user) {
      throw new BadRequestError('User not authenticated');
    }
    if (!menuItemId || !rating || !comment) {
      throw new BadRequestError('menuItemId, rating, and comment are required');
    }

    const review = new Review({
      userId: req.user.id,
      userName: req.user.name || 'Anonymous Customer',
      menuItemId,
      rating,
      comment,
    });

    await review.save();

    res.status(201).json({
      success: true,
      message: 'Review submitted successfully',
      data: review,
    });
  } catch (err) {
    next(err);
  }
};

export const getReviewsByMenuItemId = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const reviews = await Review.find({ menuItemId: req.params.menuItemId }).sort({ createdAt: -1 });
    res.json({
      success: true,
      data: reviews,
    });
  } catch (err) {
    next(err);
  }
};
