"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.registerLoyaltySubscribers = exports.validateCoupon = exports.getCoupons = exports.createCoupon = exports.getLoyaltyStatus = void 0;
const loyalty_js_1 = require("../models/loyalty.js");
const coupon_js_1 = require("../models/coupon.js");
const shared_1 = require("shared");
const getLoyaltyStatus = async (req, res, next) => {
    try {
        if (!req.user) {
            throw new shared_1.UnauthorizedError();
        }
        let loyalty = await loyalty_js_1.Loyalty.findOne({ userId: req.user.id });
        if (!loyalty) {
            // Lazy initialize loyalty card for new customers
            loyalty = new loyalty_js_1.Loyalty({
                userId: req.user.id,
                userName: req.user.name || 'Valued Customer',
            });
            await loyalty.save();
        }
        res.json({
            success: true,
            data: loyalty,
        });
    }
    catch (err) {
        next(err);
    }
};
exports.getLoyaltyStatus = getLoyaltyStatus;
const createCoupon = async (req, res, next) => {
    try {
        const { code, discountType, value, minOrderValue, expiresAt } = req.body;
        if (!code || !discountType || value === undefined || !expiresAt) {
            throw new shared_1.BadRequestError('Required: code, discountType, value, and expiresAt');
        }
        const coupon = new coupon_js_1.Coupon({
            code,
            discountType,
            value,
            minOrderValue: minOrderValue || 0,
            expiresAt: new Date(expiresAt),
        });
        await coupon.save();
        res.status(201).json({
            success: true,
            message: 'Coupon created successfully',
            data: coupon,
        });
    }
    catch (err) {
        next(err);
    }
};
exports.createCoupon = createCoupon;
const getCoupons = async (req, res, next) => {
    try {
        const coupons = await coupon_js_1.Coupon.find({ isActive: true, expiresAt: { $gt: new Date() } });
        res.json({
            success: true,
            data: coupons,
        });
    }
    catch (err) {
        next(err);
    }
};
exports.getCoupons = getCoupons;
const validateCoupon = async (req, res, next) => {
    try {
        const { code, orderValue } = req.body;
        if (!code || orderValue === undefined) {
            throw new shared_1.BadRequestError('Coupon code and orderValue are required');
        }
        const coupon = await coupon_js_1.Coupon.findOne({ code: code.toUpperCase(), isActive: true });
        if (!coupon) {
            throw new shared_1.NotFoundError('Invalid or inactive coupon code');
        }
        if (new Date() > coupon.expiresAt) {
            coupon.isActive = false;
            await coupon.save();
            throw new shared_1.BadRequestError('This coupon has expired');
        }
        if (orderValue < coupon.minOrderValue) {
            throw new shared_1.BadRequestError(`Minimum order value of $${coupon.minOrderValue} required for this coupon`);
        }
        // Calculate discount amount
        let discountAmount = 0;
        if (coupon.discountType === 'percentage') {
            discountAmount = Math.round((orderValue * (coupon.value / 100)) * 100) / 100;
        }
        else {
            discountAmount = Math.min(orderValue, coupon.value);
        }
        res.json({
            success: true,
            message: 'Coupon is valid',
            data: {
                code: coupon.code,
                discountType: coupon.discountType,
                value: coupon.value,
                discountAmount,
            },
        });
    }
    catch (err) {
        next(err);
    }
};
exports.validateCoupon = validateCoupon;
// =========================================================================
// ASYNCHRONOUS EVENT BUS SUBSCRIBERS
// =========================================================================
const registerLoyaltySubscribers = () => {
    shared_1.eventBus.subscribe('order.completed', async (payload) => {
        const { userId, total, orderId } = payload;
        console.log(`[LoyaltyService] Awarding points for completed order ${orderId} by user ${userId}`);
        try {
            let loyalty = await loyalty_js_1.Loyalty.findOne({ userId });
            if (!loyalty) {
                // Find user name or default
                loyalty = new loyalty_js_1.Loyalty({
                    userId,
                    userName: 'Customer',
                });
            }
            // 1 Point for every $1 spent
            const pointsEarned = Math.round(total);
            loyalty.points += pointsEarned;
            loyalty.totalSpent += total;
            // Auto recalculate membership tier!
            loyalty.recalculateTier();
            await loyalty.save();
            console.log(`[LoyaltyService] User ${userId} earned ${pointsEarned} points. Total Points: ${loyalty.points}. Tier: ${loyalty.tier}`);
            // Push custom event alert to the notifications service!
            await shared_1.eventBus.publish('notification.created', {
                userId,
                title: '🎉 Loyalty Points Awarded!',
                message: `You earned ${pointsEarned} loyalty points from order #${orderId.toString().slice(-6)}. Your total points balance is now ${loyalty.points} (${loyalty.tier} tier)!`,
                type: 'loyalty',
            });
        }
        catch (err) {
            console.error('[LoyaltyService] Event processor error:', err.message);
        }
    });
};
exports.registerLoyaltySubscribers = registerLoyaltySubscribers;
//# sourceMappingURL=loyalty-controller.js.map