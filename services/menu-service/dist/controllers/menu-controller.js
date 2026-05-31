"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getReviewsByMenuItemId = exports.createReview = exports.deleteMenuItem = exports.updateMenuItem = exports.getMenuItemById = exports.getMenuItems = exports.createMenuItem = void 0;
const menu_item_js_1 = require("../models/menu-item.js");
const review_js_1 = require("../models/review.js");
const shared_1 = require("shared");
const createMenuItem = async (req, res, next) => {
    try {
        const { name, description, price, category, imageUrl, isVegetarian, branchIds, nutritionalInfo, ingredients } = req.body;
        if (!name || !description || !price || !category || !imageUrl || !branchIds) {
            throw new shared_1.BadRequestError('Required fields: name, description, price, category, imageUrl, and branchIds');
        }
        const menuItem = new menu_item_js_1.MenuItem({
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
    }
    catch (err) {
        next(err);
    }
};
exports.createMenuItem = createMenuItem;
const getMenuItems = async (req, res, next) => {
    try {
        const { branchId, category, search } = req.query;
        const query = { isAvailable: true };
        if (branchId) {
            query.branchIds = branchId;
        }
        if (category) {
            query.category = category;
        }
        if (search) {
            query.name = { $regex: search, $options: 'i' };
        }
        const menuItems = await menu_item_js_1.MenuItem.find(query);
        res.json({
            success: true,
            data: menuItems,
        });
    }
    catch (err) {
        next(err);
    }
};
exports.getMenuItems = getMenuItems;
const getMenuItemById = async (req, res, next) => {
    try {
        const menuItem = await menu_item_js_1.MenuItem.findById(req.params.id);
        if (!menuItem) {
            throw new shared_1.NotFoundError('Menu item not found');
        }
        res.json({
            success: true,
            data: menuItem,
        });
    }
    catch (err) {
        next(err);
    }
};
exports.getMenuItemById = getMenuItemById;
const updateMenuItem = async (req, res, next) => {
    try {
        const menuItem = await menu_item_js_1.MenuItem.findByIdAndUpdate(req.params.id, req.body, { new: true });
        if (!menuItem) {
            throw new shared_1.NotFoundError('Menu item not found');
        }
        res.json({
            success: true,
            message: 'Menu item updated successfully',
            data: menuItem,
        });
    }
    catch (err) {
        next(err);
    }
};
exports.updateMenuItem = updateMenuItem;
const deleteMenuItem = async (req, res, next) => {
    try {
        const menuItem = await menu_item_js_1.MenuItem.findByIdAndDelete(req.params.id);
        if (!menuItem) {
            throw new shared_1.NotFoundError('Menu item not found');
        }
        res.json({
            success: true,
            message: 'Menu item deleted successfully',
        });
    }
    catch (err) {
        next(err);
    }
};
exports.deleteMenuItem = deleteMenuItem;
const createReview = async (req, res, next) => {
    try {
        const { menuItemId, rating, comment } = req.body;
        if (!req.user) {
            throw new shared_1.BadRequestError('User not authenticated');
        }
        if (!menuItemId || !rating || !comment) {
            throw new shared_1.BadRequestError('menuItemId, rating, and comment are required');
        }
        const review = new review_js_1.Review({
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
    }
    catch (err) {
        next(err);
    }
};
exports.createReview = createReview;
const getReviewsByMenuItemId = async (req, res, next) => {
    try {
        const reviews = await review_js_1.Review.find({ menuItemId: req.params.menuItemId }).sort({ createdAt: -1 });
        res.json({
            success: true,
            data: reviews,
        });
    }
    catch (err) {
        next(err);
    }
};
exports.getReviewsByMenuItemId = getReviewsByMenuItemId;
//# sourceMappingURL=menu-controller.js.map